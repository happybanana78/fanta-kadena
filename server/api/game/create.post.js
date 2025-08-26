import { PrismaClient } from '@prisma/client';
import { Pact, createClient, createSignWithChainweaver, isSignedTransaction, readKeyset } from '@kadena/client';
import { createGameSchema } from "~~/shared/schemas/game/create.js";
import {useValidate} from "~~/server/utils/useValidate.js";
import { v4 as uuidv4 } from 'uuid';
import {useParseDate} from "~~/composables/useParseDate.js";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const host = config.KADENA_HOST;

    const body = await readBody(event);

    const parsed = useValidate(createGameSchema, body);

    const creatorAccount = "k:341393b952e197d2e3b01051acdb80b88d9393406c905b3f553fe14c7d27810a";
    const creatorPubKey = "341393b952e197d2e3b01051acdb80b88d9393406c905b3f553fe14c7d27810a";
    const parsedDate = useParseDate(parsed.expiration, true);
    const parsedFee = parseFloat(parsed.participation_fee.toFixed(1));

    //console.log('gigi2', parsed);

    const client = createClient(host);

    const args = [
        `${parsed.name}-${uuidv4()}`,
        parsed.name,
        parsed.description,
        parsedDate,
        parsed.options.map(opt => opt.name),
        { decimal: parsedFee },
        readKeyset("creator-ks"),
        creatorAccount
    ];

    const code = Pact.modules[config.MODULE_NAME]['create-session'](...args);

    const pactTx = Pact.builder
        .execution(code)
        .addData('creator-ks', {
            keys: [creatorPubKey],
            pred: 'keys-all',
        })
        .addSigner(creatorPubKey, (withCap) => [
            withCap('coin.GAS'),
            withCap('coin.TRANSFER', creatorAccount, config.TREASURY_ACCOUNT, 10.0),
        ])
        .setMeta({
            chainId: config.KADENA_CHAIN_ID,
            senderAccount: creatorAccount
        })
        .setNetworkId(config.KADENA_NETWORK_ID)
        .createTransaction();

    const signWithKeypair = createSignWithChainweaver();

    const signedTx = await signWithKeypair(pactTx);

    if (isSignedTransaction(signedTx)) {
        const submitRes = await client.submit(signedTx);
        const listenRes = await client.listen({ requestKey: submitRes.requestKey });

        if (listenRes.result.status !== 'success') {
            return { ok: false, error: listenRes.result.error };
        }

        // Save new wallet account to db
        // await prisma.wallet.create({
        //     data: {
        //         account,
        //         pubKey: pubHex,
        //         secretKey: useEncryptKey(privHex),
        //         chainId: String(config.KADENA_CHAIN_ID),
        //         networkId: config.KADENA_NETWORK_ID,
        //         userId: userId,
        //     },
        // });

        return {
            ok: true,
            data: null,
        };
    }

    return { ok: false, error: 'general error' };
});

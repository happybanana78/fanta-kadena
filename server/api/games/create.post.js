import { PrismaClient } from '@prisma/client';
import { Pact, createClient, createSignWithChainweaver, isSignedTransaction } from '@kadena/client';
import { createGameSchema } from "~~/shared/schemas/game/create.js";
import {useValidate} from "~~/server/utils/useValidate.js";
import { v4 as uuidv4 } from 'uuid';
import {useParseDate} from "~~/composables/useParseDate.js";
import {useGetTreasuryAccount} from "~~/server/utils/useGetTreasuryAccount.js";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const host = config.KADENA_HOST;

    const body = await readBody(event);

    const parsed = useValidate(createGameSchema, body.data);

    const parsedId = `${parsed.name.replace(/ /g, '-')}-${uuidv4()}`;
    const creatorAccount = parsed.account;
    const creatorPubKey = parsed.account.slice(2);
    const parsedDate = useParseDate({date: parsed.expiration, toIso: true});
    const parsedFee = parseFloat(parsed.participation_fee.toFixed(1));

    const gasSettings = body.gasSettings;

    const treasuryAccount = await useGetTreasuryAccount();

    if (!treasuryAccount.ok) {
        return { ok: false, error: treasuryAccount.error };
    }

    const client = createClient(host);

    const args = [
        parsedId,
        parsed.name,
        parsed.description,
        parsedDate,
        parsed.options.map(opt => opt.name),
        { decimal: parsedFee },
        creatorAccount
    ];

    const code = Pact.modules[config.MODULE_NAME]['create-session'](...args);

    const pactTx = Pact.builder
        .execution(code)
        .addSigner(creatorPubKey, (withCap) => [
            withCap('coin.GAS'),
            withCap('coin.TRANSFER', creatorAccount, treasuryAccount.data, 10.0),
        ])
        .setMeta({
            chainId: config.KADENA_CHAIN_ID,
            senderAccount: creatorAccount,
            gasLimit: gasSettings.gasLimit,
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

        const data = listenRes.result.data;

        // Save new wallet account to db
        await prisma.session.create({
            data: {
                id: parsedId,
                name: data.name,
                description: data.description,
                expiration: data.expiration.time,
                options: data.options,
                fee: data['participation-fee'],
                creator_account: data['creator-account'],
                result_released_at: data['result-released-at'].time,
                correct: data.correct.int,
                invalidated: data.invalidated,
                total_winners: data['total-winners'].int,
                result_voted: data['result-voted'],
                creator_slashed: data['creator-slashed'],
            },
        });

        return {
            ok: true,
            data: {
                session_id: parsedId,
            },
        };
    }

    return { ok: false, error: 'general error' };
});

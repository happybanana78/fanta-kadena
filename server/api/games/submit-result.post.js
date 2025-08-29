import { PrismaClient } from '@prisma/client';
import { Pact, createClient, createSignWithChainweaver, isSignedTransaction } from '@kadena/client';
import {useParseDate} from "~~/composables/useParseDate.js";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const host = config.KADENA_HOST;

    const body = await readBody(event);

    const account = body.account;
    const accountPubKey = body.account.slice(2);

    const gasSettings = body.gasSettings;

    const client = createClient(host);

    const args = [
        body.id,
        { int: body.option },
    ];

    const code = Pact.modules[config.MODULE_NAME]['reveal-correct'](...args);

    const pactTx = Pact.builder
        .execution(code)
        .addSigner(accountPubKey, (withCap) => [
            withCap('coin.GAS'),
            withCap(`${config.MODULE_NAME}.ACCOUNT_GUARD`, account),
        ])
        .setMeta({
            chainId: config.KADENA_CHAIN_ID,
            senderAccount: account,
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

        // Update session
        await prisma.session.update({
            where: {
                id: body.id,
            },
            data: {
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
            data: null,
        };
    }

    return { ok: false, error: 'general error' };
});

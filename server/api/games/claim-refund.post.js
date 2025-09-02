import { PrismaClient } from '@prisma/client';
import { Pact, createClient, createSignWithChainweaver, isSignedTransaction } from '@kadena/client';
import {useGetTreasuryAccount} from "~~/server/utils/useGetTreasuryAccount.js";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const host = config.KADENA_HOST;

    const body = await readBody(event);

    const account = body.account;
    const accountPubKey = body.account.slice(2);

    const gasSettings = body.gasSettings;

    const treasuryAccount = await useGetTreasuryAccount();

    if (!treasuryAccount.ok) {
        return { ok: false, error: treasuryAccount.error };
    }

    const client = createClient(host);

    const args = [
        body.id,
        account,
    ];

    const code = Pact.modules[config.MODULE_NAME]['claim-refund'](...args);

    const pactTx = Pact.builder
        .execution(code)
        .addSigner(accountPubKey, (withCap) => [
            withCap('coin.GAS'),
            withCap(`${config.MODULE_NAME}.ACCOUNT_GUARD`, account),
            withCap('coin.TRANSFER', treasuryAccount.data, account, { decimal: parseFloat(body.fee).toFixed(1)}),
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

        // Update session
        await prisma.session.update({
            where: {
                id: body.id,
            },
            data: {
                invalidated: true,
                creator_slashed: body.slashCreator,
            },
        });

        // Update vote
        await prisma.optionVote.update({
            where: {
                session_id: body.id,
                voter_account: account,
            },
            data: {
                refunded: true,
            },
        });

        return {
            ok: true,
            data: null,
        };
    }

    return { ok: false, error: 'general error' };
});

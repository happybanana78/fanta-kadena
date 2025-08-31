import { PrismaClient } from '@prisma/client';
import { Pact, createClient, createSignWithChainweaver, isSignedTransaction } from '@kadena/client';

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
    ];

    const code = Pact.modules[config.MODULE_NAME]['claim-creator-funds'](...args);

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

        // Update session
        await prisma.session.update({
            where: {
                id: body.id,
            },
            data: {
                invalidated: true,
            },
        });

        return {
            ok: true,
            data: null,
        };
    }

    return { ok: false, error: 'general error' };
});

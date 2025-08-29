import { PrismaClient } from '@prisma/client';
import { Pact, createClient, createSignWithChainweaver, isSignedTransaction, readKeyset } from '@kadena/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const host = config.KADENA_HOST;

    const body = await readBody(event);

    const account = body.account;
    const accountPubKey = body.account.slice(2);
    const parsedFee = parseFloat(body.fee.toFixed(1));

    const client = createClient(host);

    const args = [
        body.id,
        account,
        readKeyset("voter-ks"),
        { int: body.option },
    ];

    const code = Pact.modules[config.MODULE_NAME]['vote-option'](...args);

    const pactTx = Pact.builder
        .execution(code)
        .addData('voter-ks', {
            keys: [accountPubKey],
            pred: 'keys-all',
        })
        .addSigner(accountPubKey, (withCap) => [
            withCap('coin.GAS'),
            withCap('coin.TRANSFER', account, config.TREASURY_ACCOUNT, parsedFee),
        ])
        .setMeta({
            chainId: config.KADENA_CHAIN_ID,
            senderAccount: account
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

        // Save new vote to db
        await prisma.optionVote.create({
            data: {
                session_id: body.id,
                voter_account: account,
                voter_guard: accountPubKey,
                option: body.option,
            },
        });

        return {
            ok: true,
            data: null,
        };
    }

    return { ok: false, error: 'general error' };
});

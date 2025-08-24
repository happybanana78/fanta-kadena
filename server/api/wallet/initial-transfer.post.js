import { Pact, createClient, createSignWithKeypair, isSignedTransaction } from '@kadena/client';
import { PactNumber } from '@kadena/pactjs';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const host = config.KADENA_HOST;

    const { account } = await readBody(event);
    if (!account) {
        return { ok: false, error: 'Missing account' };
    }

    const client = createClient(host);

    const pactAmount = new PactNumber(10.0).toPactDecimal();

    const code = Pact.modules.coin['transfer-create'](config.GAS_PAYER_ACCOUNT, account, () => '(read-keyset "ks")', pactAmount);

    const pactTx = Pact.builder
        .execution(code)
        .addData('ks', {
            keys: [account.split(':')[1]],
            pred: 'keys-all',
        })
        .addSigner(config.GAS_PAYER_PUBKEY, (withCap) => [
            withCap('coin.GAS'),
            withCap('coin.TRANSFER', config.GAS_PAYER_ACCOUNT, account, pactAmount),
        ])
        .setMeta({
            chainId: String(config.KADENA_CHAIN_ID),
            senderAccount: config.GAS_PAYER_ACCOUNT
        })
        .setNetworkId(config.KADENA_NETWORK_ID)
        .createTransaction();

    const signWithKeypair = createSignWithKeypair({
        publicKey: config.GAS_PAYER_PUBKEY,
        secretKey: config.GAS_PAYER_PRIVKEY,
    });

    const signedTx = await signWithKeypair(pactTx);

    if (isSignedTransaction(signedTx)) {
        const submitRes = await client.submit(signedTx);
        const listenRes = await client.listen({ requestKey: submitRes.requestKey });

        if (listenRes.result.status !== 'success') {
            return { ok: false, error: listenRes.result.error };
        }

        return { ok: true, data: listenRes };
    }

    return { ok: false, error: 'general error' };
});

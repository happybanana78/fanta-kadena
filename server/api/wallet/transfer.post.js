import { PrismaClient } from '@prisma/client';
import { createClient, createSignWithKeypair, Pact, isSignedTransaction } from '@kadena/client';
import { PactNumber } from '@kadena/pactjs';
import { useDecryptKey } from "~~/composables/useDecryptKey.js";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const host = config.KADENA_HOST;

    const { id, toAccount, amount } = await readBody(event);

    const rec = await prisma.wallet.findUnique({ where: { id } });
    if (!rec) return { ok: false, error: 'Unknown id' };

    const client = createClient(host);

    const pactAmount = new PactNumber(amount).toPactDecimal();

    //console.log('baby', pactAmount);

    // Build a transfer USING the wallet’s own key to authorize
    const code = Pact.modules.coin.transfer(rec.account, toAccount, { decimal: pactAmount.decimal });

    const pactTx = Pact.builder
        .execution(code)
        .addSigner(rec.pubKey, (withCap) => [
            withCap('coin.GAS'),
            withCap('coin.TRANSFER', rec.account, toAccount, { decimal: pactAmount.decimal }),
        ])
        .setMeta({
            chainId: String(config.KADENA_CHAIN_ID),
            senderAccount: rec.account,
        })
        .setNetworkId(config.KADENA_NETWORK_ID)
        .createTransaction();

    const signWithKeypair = createSignWithKeypair({
        publicKey: rec.pubKey,
        secretKey: useDecryptKey(rec.secretKey),
    });

    const signedTx = await signWithKeypair(pactTx);

    if (isSignedTransaction(signedTx)) {
        const submitRes = await client.submit(signedTx);
        const listenRes = await client.listen({ requestKey: submitRes.requestKey });

        if (listenRes.result.status !== 'success') {
            return { ok: false, error: listenRes.result.error };
        }

        return { ok: listenRes.result.status === 'success', tx: listenRes };
    }

    return { ok: false, error: 'general error' };
});

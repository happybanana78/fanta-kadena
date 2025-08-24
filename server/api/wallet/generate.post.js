import { PrismaClient } from '@prisma/client';
import nacl from 'tweetnacl';
import { Pact, createClient, createSignWithKeypair, isSignedTransaction } from '@kadena/client';
import { useToHex } from "~~/composables/useToHex.js";
import { useEncryptKey } from "~~/composables/useEncryptKey.js";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const host = config.KADENA_HOST;

    const { userId } = await readBody(event);
    if (!userId) {
        return { ok: false, error: 'Missing user id' };
    }

    const client = createClient(host);

    // Generate ed25519 keypair
    const kp = nacl.sign.keyPair();
    const pubHex = useToHex(kp.publicKey);
    const privHex = useToHex(kp.secretKey.slice(0, 32));

    // Generate account name
    const account = `k:${pubHex}`;

    const code = Pact.modules.coin['create-account'](account, () => '(read-keyset "ks")');

    const pactTx = Pact.builder
        .execution(code)
        .addData('ks', {
            keys: [pubHex],
            pred: 'keys-all',
        })
        .addSigner(config.GAS_PAYER_PUBKEY, (withCap) => [withCap('coin.GAS')])
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

        // Save new wallet account to db
        await prisma.wallet.create({
            data: {
                account,
                pubKey: pubHex,
                secretKey: useEncryptKey(privHex),
                chainId: String(config.KADENA_CHAIN_ID),
                networkId: config.KADENA_NETWORK_ID,
                userId: userId,
            },
        });

        return {
            ok: true,
            data: null,
        };
    }

    return { ok: false, error: 'general error' };
});

import { Pact, createClient } from '@kadena/client';

export const useGetTreasuryAccount = async () => {
    const config = useRuntimeConfig();
    const host = config.KADENA_HOST;

    const client = createClient(host);

    const code = `${config.MODULE_NAME}.TREASURY_ACCOUNT`;

    const pactTx = Pact.builder
        .execution(code)
        .setMeta({
            chainId: config.KADENA_CHAIN_ID,
            //gasLimit: 10000,
        })
        .setNetworkId(config.KADENA_NETWORK_ID)
        .createTransaction();

    const submitRes = await client.dirtyRead(pactTx);

    if (submitRes.result.status !== 'success') {
        return { ok: false, error: submitRes.result.error };
    }

    return {
        ok: true,
        data: submitRes.result.data,
    };
}

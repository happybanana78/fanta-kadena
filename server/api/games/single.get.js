import { PrismaClient } from '@prisma/client';
import {useParseStatus} from "~~/server/utils/useParseStatus.js";
import {useSerialize} from "~~/server/utils/useSerialize.js";
import {useAddToDate} from "~~/composables/useAddToDate.js";
import {useParseDate} from "~~/composables/useParseDate.js";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const query = getQuery(event);

    const session = await prisma.session.findFirst({
        where: {
            id: query.id,
        },
        include: {
            votes: true,
            result_votes: true,
        },
    });

    if (!session) {
        return { ok: false, error: null };
    }

    const serialized = useSerialize({
        ...session,
        expiration: useParseDate({date: session.expiration, standard: true}).toString(),
        publish_expiration: useAddToDate(useParseDate({date: session.expiration, standard: true}), 'days', parseFloat(config.public.GRACE_DAYS)),
        status: useParseStatus(session),
        total_voters: session.votes.length,
        is_expired: useParseDate({date: new Date(), standard: true}) > useParseDate({date: session.expiration, standard: true}),
    });

    return {
        ok: true,
        data: serialized,
    };
});

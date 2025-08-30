import { PrismaClient } from '@prisma/client';
import {useParseStatus} from "~~/server/utils/useParseStatus.js";
import {useSerialize} from "~~/server/utils/useSerialize.js";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
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
        expiration: new Date(session.expiration).toString(),
        publish_expiration: new Date(new Date(session.expiration).getTime() + 24 * 60 * 60 * 1000).toString(), // +1 day
        status: useParseStatus(session),
        total_voters: session.votes.length,
        is_expired: new Date() > new Date(session.expiration),
    });

    return {
        ok: true,
        data: serialized,
    };
});

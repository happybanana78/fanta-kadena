import { PrismaClient } from '@prisma/client';
import {useParseDate} from "~~/composables/useParseDate.js";
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
        },
    });

    if (!session) {
        return { ok: false, error: null };
    }

    const serialized = useSerialize({
        ...session,
        expiration: useParseDate(session.expiration, false),
        status: useParseStatus(session),
        total_voters: session.votes.length,
    });

    return {
        ok: true,
        data: serialized,
    };
});

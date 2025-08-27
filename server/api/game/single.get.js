import { PrismaClient } from '@prisma/client';
import {useParseDate} from "~~/composables/useParseDate.js";

const prisma = new PrismaClient();

const parseStatus = (session) => {
    if (session.result_voted === 0) {
        return 'Active';
    } else if (session.invalidated === 1) {
        return 'Invalidated';
    } else {
        return 'Closed';
    }
}

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

    const serialized = {
        ...session,
        expiration: useParseDate(session.expiration, false),
        correct: session.correct.toString(),
        total_winners: session.total_winners.toString(),
        status: parseStatus(session),
        total_voters: session.votes.length,
    }

    return {
        ok: true,
        data: serialized,
    };
});

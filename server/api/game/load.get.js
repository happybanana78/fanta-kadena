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

    // Handle expiration filtering
    let expiration;

    if (query.expired !== 'true') {
        expiration = {
            lt: new Date(),
        }
    } else {
        expiration = {
            gt: new Date(),
        }
    }

    const sessions = await prisma.session.findMany({
        where: {
            expiration: expiration,
        },
        orderBy: {
            expiration: 'asc',
        },
    });

    const serialized = sessions.map(session => ({
        ...session,
        expiration: useParseDate(session.expiration, false),
        correct: session.correct.toString(),
        total_winners: session.total_winners.toString(),
        status: parseStatus(session),
    }));

    return {
        ok: true,
        data: serialized,
    };
});

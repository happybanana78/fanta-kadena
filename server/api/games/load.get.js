import { PrismaClient } from '@prisma/client';
import {useParseDate} from "~~/composables/useParseDate.js";
import {useParseStatus} from "~~/server/utils/useParseStatus.js";
import {useSerialize} from "~~/server/utils/useSerialize.js";

const prisma = new PrismaClient();

export default defineEventHandler(async () => {
    const sessions = await prisma.session.findMany({
        orderBy: {
            created_at: 'desc',
        },
        include: {
            votes: true,
            result_votes: true,
        },
    });

    const serialized = sessions.map(session => useSerialize({
        ...session,
        expiration: useParseDate({date: session.expiration}),
        correct: session.correct.toString(),
        total_winners: session.total_winners.toString(),
        status: useParseStatus(session),
    }));

    return {
        ok: true,
        data: serialized,
    };
});

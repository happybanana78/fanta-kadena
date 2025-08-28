import { PrismaClient } from '@prisma/client';
import {useParseDate} from "~~/composables/useParseDate.js";
import {useParseStatus} from "~~/server/utils/useParseStatus.js";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    const sessions = await prisma.session.findMany();

    const serialized = sessions.map(session => ({
        ...session,
        expiration: useParseDate(session.expiration, false),
        correct: session.correct.toString(),
        total_winners: session.total_winners.toString(),
        status: useParseStatus(session),
    }));

    return {
        ok: true,
        data: serialized,
    };
});

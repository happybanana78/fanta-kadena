import { PrismaClient } from '@prisma/client';
import {useParseDate} from "~~/composables/useParseDate.js";
import {useSerialize} from "~~/server/utils/useSerialize.js";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    const votes = await prisma.optionVote.findMany({
        where: {
            session_id: query.session_id,
        },
    });

    const serialized = votes.map(vote => useSerialize({
        ...vote,
        voted_at: useParseDate({date: vote.voted_at}),
    }));

    return {
        ok: true,
        data: serialized,
    };
});

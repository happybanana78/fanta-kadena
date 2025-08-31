import { PrismaClient } from '@prisma/client';
import {useParseDate} from "~~/composables/useParseDate.js";
import {useSerialize} from "~~/server/utils/useSerialize.js";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    const vote = await prisma.optionVote.findFirst({
        where: {
            voter_account: query.account,
            session_id: query.session_id,
        },
    });

    if (!vote) {
        return { ok: false, error: null };
    }

    const serialized = useSerialize({
        ...vote,
        voted_at: useParseDate({date: vote.voted_at}),
    });

    return {
        ok: true,
        data: serialized,
    };
});

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    await prisma.user.delete({
        where: { id: body.userId },
    });

    return {
        ok: true,
        data: null,
    };
});

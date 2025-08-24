import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
    const hashedPassword = await bcrypt.hash('password', 10)

    const data = await prisma.user.create({
        data: {
            username: (Math.random() + 1).toString(36).substring(7),
            password: hashedPassword,
        },
    });

    return {
        ok: true,
        data: {
            id: data.id,
        },
    };
});

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const merchant = await prisma.merchant.create({
        data: {
            name: 'merchant1',
            Wallet: {
                create: {
                    account: 'k:7ebadf8a84dfeb95308a21a0a7e79e8f0faa07d20cd916099bbb4aba124a77ba',
                    pubKey: '7ebadf8a84dfeb95308a21a0a7e79e8f0faa07d20cd916099bbb4aba124a77ba',
                    secretKey: '8cf61161250d40a679081b2d:917ad92f2feaee08f04c4d32cd99682e6a6d1e285d49584a02aebb77a59f38a59bbbb8885c9e6796a4a7a56fa8e7235a06c6bb73eaca4bb13698b6dc0a59fc8e:03aea7bbbe45028d6f5fb202cacc3381',
                    chainId: '1',
                    networkId: 'development',
                }
            }
        },
        include: { Wallet: true }
    });

    console.log('Seeded merchant:', merchant);
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    });

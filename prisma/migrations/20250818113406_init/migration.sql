-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "account" TEXT NOT NULL,
    "pubKey" TEXT NOT NULL,
    "secretKey" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "networkId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_account_key" ON "Wallet"("account");

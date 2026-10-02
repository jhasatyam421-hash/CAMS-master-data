-- CreateTable
CREATE TABLE "EmailRecipient" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "stage" INTEGER NOT NULL,
    "department" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Mine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "area" TEXT,
    "company" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AuctionNotification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "supplier" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OfferedQuantity" (
    "notificationId" TEXT NOT NULL,
    "sno" INTEGER NOT NULL,
    "mine" TEXT NOT NULL,
    "coalType" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,

    PRIMARY KEY ("notificationId", "sno"),
    CONSTRAINT "OfferedQuantity_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "AuctionNotification" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AuctionNotification_number_key" ON "AuctionNotification"("number");

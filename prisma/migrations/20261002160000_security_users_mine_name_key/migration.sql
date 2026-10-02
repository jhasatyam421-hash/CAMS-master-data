PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Mine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "area" TEXT,
    "company" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "new_Mine" ("id", "name", "nameKey", "area", "company", "active", "createdAt", "updatedAt")
SELECT "id", "name", lower(trim("name")), "area", "company", "active", "createdAt", "updatedAt"
FROM "Mine";

DROP TABLE "Mine";
ALTER TABLE "new_Mine" RENAME TO "Mine";
CREATE UNIQUE INDEX "Mine_nameKey_key" ON "Mine"("nameKey");

CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'Procurement',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

PRAGMA foreign_keys=ON;
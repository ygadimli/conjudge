-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "country" TEXT,
    "city" TEXT,
    "bio" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" DATETIME,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "battleRating" INTEGER NOT NULL DEFAULT 0,
    "maxRating" INTEGER NOT NULL DEFAULT 0,
    "brainType" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "bannedAt" DATETIME,
    "banReason" TEXT,
    "profilePicture" TEXT,
    "lastVisit" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("banReason", "bannedAt", "battleRating", "bio", "brainType", "city", "country", "createdAt", "email", "id", "isBanned", "lastVisit", "maxRating", "name", "password", "profilePicture", "rating", "role", "updatedAt", "username") SELECT "banReason", "bannedAt", "battleRating", "bio", "brainType", "city", "country", "createdAt", "email", "id", "isBanned", "lastVisit", "maxRating", "name", "password", "profilePicture", "rating", "role", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

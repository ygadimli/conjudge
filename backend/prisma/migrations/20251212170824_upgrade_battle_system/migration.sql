/*
  Warnings:

  - You are about to drop the column `info` on the `BattleParticipant` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `Battle` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Battle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "joinCode" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "minRating" INTEGER,
    "maxRating" INTEGER,
    "region" TEXT,
    "country" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 1800,
    "problemCount" INTEGER NOT NULL DEFAULT 5,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "Battle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Battle" ("createdAt", "endTime", "id", "startTime", "status", "type") SELECT "createdAt", "endTime", "id", "startTime", "status", "type" FROM "Battle";
DROP TABLE "Battle";
ALTER TABLE "new_Battle" RENAME TO "Battle";
CREATE UNIQUE INDEX "Battle_joinCode_key" ON "Battle"("joinCode");
CREATE TABLE "new_BattleParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "score" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "ratingChange" INTEGER NOT NULL DEFAULT 0,
    "oldRating" INTEGER,
    "newRating" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "battleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "BattleParticipant_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BattleParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_BattleParticipant" ("battleId", "id", "rank", "score", "userId") SELECT "battleId", "id", "rank", "score", "userId" FROM "BattleParticipant";
DROP TABLE "BattleParticipant";
ALTER TABLE "new_BattleParticipant" RENAME TO "BattleParticipant";
CREATE TABLE "new_BattleRound" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "order" INTEGER NOT NULL,
    "problemRating" INTEGER,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "battleId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    CONSTRAINT "BattleRound_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BattleRound_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_BattleRound" ("battleId", "duration", "id", "order", "problemId") SELECT "battleId", "duration", "id", "order", "problemId" FROM "BattleRound";
DROP TABLE "BattleRound";
ALTER TABLE "new_BattleRound" RENAME TO "BattleRound";
CREATE TABLE "new_Submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "runtime" INTEGER NOT NULL,
    "memory" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Submission_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Submission" ("code", "createdAt", "id", "language", "memory", "problemId", "runtime", "score", "status", "userId") SELECT "code", "createdAt", "id", "language", "memory", "problemId", "runtime", "score", "status", "userId" FROM "Submission";
DROP TABLE "Submission";
ALTER TABLE "new_Submission" RENAME TO "Submission";
CREATE TABLE "new_SubmissionAnalysis" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "submissionId" TEXT NOT NULL,
    "complexity" TEXT,
    "style" TEXT,
    "suggestions" TEXT NOT NULL,
    "brainTypeData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SubmissionAnalysis_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SubmissionAnalysis" ("brainTypeData", "complexity", "createdAt", "id", "style", "submissionId", "suggestions") SELECT "brainTypeData", "complexity", "createdAt", "id", "style", "submissionId", "suggestions" FROM "SubmissionAnalysis";
DROP TABLE "SubmissionAnalysis";
ALTER TABLE "new_SubmissionAnalysis" RENAME TO "SubmissionAnalysis";
CREATE UNIQUE INDEX "SubmissionAnalysis_submissionId_key" ON "SubmissionAnalysis"("submissionId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "country" TEXT,
    "city" TEXT,
    "bio" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" DATETIME,
    "googleId" TEXT,
    "githubId" TEXT,
    "needsUsernameSetup" BOOLEAN NOT NULL DEFAULT false,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "battleRating" INTEGER NOT NULL DEFAULT 1200,
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
INSERT INTO "new_User" ("banReason", "bannedAt", "battleRating", "bio", "brainType", "city", "country", "createdAt", "email", "githubId", "googleId", "id", "isBanned", "isVerified", "lastVisit", "maxRating", "name", "needsUsernameSetup", "password", "profilePicture", "rating", "resetPasswordExpires", "resetPasswordToken", "role", "updatedAt", "username", "verificationToken") SELECT "banReason", "bannedAt", "battleRating", "bio", "brainType", "city", "country", "createdAt", "email", "githubId", "googleId", "id", "isBanned", "isVerified", "lastVisit", "maxRating", "name", "needsUsernameSetup", "password", "profilePicture", "rating", "resetPasswordExpires", "resetPasswordToken", "role", "updatedAt", "username", "verificationToken" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
CREATE UNIQUE INDEX "User_githubId_key" ON "User"("githubId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

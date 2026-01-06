-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Problem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 800,
    "category" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "testCases" TEXT NOT NULL,
    "timeLimit" INTEGER NOT NULL DEFAULT 1000,
    "memoryLimit" INTEGER NOT NULL DEFAULT 256,
    "isAiGenerated" BOOLEAN NOT NULL DEFAULT false,
    "externalSource" TEXT,
    "externalId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "solveCount" INTEGER NOT NULL DEFAULT 0,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "dynamicDifficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "createdById" TEXT,
    CONSTRAINT "Problem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Problem" ("category", "createdAt", "createdById", "description", "difficulty", "externalId", "externalSource", "id", "isAiGenerated", "memoryLimit", "rating", "tags", "testCases", "timeLimit", "title", "updatedAt") SELECT "category", "createdAt", "createdById", "description", "difficulty", "externalId", "externalSource", "id", "isAiGenerated", "memoryLimit", "rating", "tags", "testCases", "timeLimit", "title", "updatedAt" FROM "Problem";
DROP TABLE "Problem";
ALTER TABLE "new_Problem" RENAME TO "Problem";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

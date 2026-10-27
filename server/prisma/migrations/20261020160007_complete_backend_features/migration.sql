-- AlterTable
ALTER TABLE "game_saves" ADD COLUMN     "characterArchetype" TEXT NOT NULL DEFAULT 'custom',
ADD COLUMN     "healthScoreValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "netWorth" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "totalMonthsSimulated" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "promotion_logs" (
    "id" TEXT NOT NULL,
    "gameSaveId" TEXT NOT NULL,
    "previousTitle" TEXT NOT NULL,
    "newTitle" TEXT NOT NULL,
    "previousSalary" DOUBLE PRECISION NOT NULL,
    "newSalary" DOUBLE PRECISION NOT NULL,
    "hikePercentage" DOUBLE PRECISION NOT NULL,
    "bonusAmount" DOUBLE PRECISION NOT NULL,
    "lifestyleChoice" TEXT NOT NULL,
    "monthSimulated" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_chat_logs" (
    "id" TEXT NOT NULL,
    "gameSaveId" TEXT NOT NULL,
    "userQuery" TEXT NOT NULL,
    "coachResponse" TEXT NOT NULL,
    "monthSimulated" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coach_chat_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "promotion_logs_gameSaveId_idx" ON "promotion_logs"("gameSaveId");

-- CreateIndex
CREATE INDEX "coach_chat_logs_gameSaveId_idx" ON "coach_chat_logs"("gameSaveId");

-- CreateIndex
CREATE INDEX "decision_logs_gameSaveId_idx" ON "decision_logs"("gameSaveId");

-- CreateIndex
CREATE INDEX "game_saves_userId_idx" ON "game_saves"("userId");

-- CreateIndex
CREATE INDEX "game_saves_netWorth_idx" ON "game_saves"("netWorth" DESC);

-- CreateIndex
CREATE INDEX "game_saves_healthScoreValue_idx" ON "game_saves"("healthScoreValue" DESC);

-- AddForeignKey
ALTER TABLE "promotion_logs" ADD CONSTRAINT "promotion_logs_gameSaveId_fkey" FOREIGN KEY ("gameSaveId") REFERENCES "game_saves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_chat_logs" ADD CONSTRAINT "coach_chat_logs_gameSaveId_fkey" FOREIGN KEY ("gameSaveId") REFERENCES "game_saves"("id") ON DELETE CASCADE ON UPDATE CASCADE;

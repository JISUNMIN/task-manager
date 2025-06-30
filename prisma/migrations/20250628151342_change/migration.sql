/*
  Warnings:

  - You are about to drop the column `projectId` on the `Project` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[projectName]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Project_projectId_key";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "projectId",
ADD COLUMN     "projectName" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Project_projectName_key" ON "Project"("projectName");

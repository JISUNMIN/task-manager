-- CreateEnum
CREATE TYPE "ProjectLabel" AS ENUM ('feature', 'bug', 'design', 'refactor', 'client', 'internal', 'maintenance');

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "label" "ProjectLabel";

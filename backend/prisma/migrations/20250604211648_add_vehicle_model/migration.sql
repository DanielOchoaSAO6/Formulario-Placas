/*
  Warnings:

  - You are about to drop the column `cedula` on the `vehicle` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `vehicle` table. All the data in the column will be lost.
  - Added the required column `conductorId` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `vehicle` DROP FOREIGN KEY `Vehicle_cedula_fkey`;

-- DropIndex
DROP INDEX `Vehicle_cedula_idx` ON `vehicle`;

-- AlterTable
ALTER TABLE `vehicle` DROP COLUMN `cedula`,
    DROP COLUMN `nombre`,
    ADD COLUMN `conductorId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_conductorId_fkey` FOREIGN KEY (`conductorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE `vehicle` DROP FOREIGN KEY `Vehicle_conductorId_fkey`;

-- DropIndex
DROP INDEX `Vehicle_conductorId_fkey` ON `vehicle`;

-- AlterTable
ALTER TABLE `vehicle` MODIFY `conductorId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_conductorId_fkey` FOREIGN KEY (`conductorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

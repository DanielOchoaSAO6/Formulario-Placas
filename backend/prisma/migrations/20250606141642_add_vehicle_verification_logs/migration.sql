-- CreateTable
CREATE TABLE `VehicleVerificationLog` (
    `id` VARCHAR(191) NOT NULL,
    `placa` VARCHAR(191) NOT NULL,
    `encontrado` BOOLEAN NOT NULL,
    `userId` VARCHAR(191) NULL,
    `startTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endTime` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `VehicleVerificationLog` ADD CONSTRAINT `VehicleVerificationLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE `Vehicle` (
    `id` VARCHAR(191) NOT NULL,
    `cedula` VARCHAR(191) NOT NULL,
    `placa` VARCHAR(191) NOT NULL,
    `estado` VARCHAR(191) NOT NULL,
    `tipoVehiculo` VARCHAR(191) NOT NULL,
    `origen` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `cargo` VARCHAR(191) NOT NULL,
    `area` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Vehicle_placa_key`(`placa`),
    INDEX `Vehicle_cedula_idx`(`cedula`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Vehicle` ADD CONSTRAINT `Vehicle_cedula_fkey` FOREIGN KEY (`cedula`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

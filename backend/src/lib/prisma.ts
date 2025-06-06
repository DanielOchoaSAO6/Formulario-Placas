// Utilizando require para evitar problemas de importación con TypeScript
const { PrismaClient } = require('@prisma/client');

// Instancia global para evitar múltiples conexiones
const prisma = new PrismaClient();

export default prisma;

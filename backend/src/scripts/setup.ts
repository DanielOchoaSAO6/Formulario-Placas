import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

/**
 * Script para configurar el entorno de desarrollo del backend
 * - Verifica y crea archivo .env si no existe
 * - Genera el cliente Prisma
 * - Ejecuta migraciones si es necesario
 */

// Cargar variables de entorno
dotenv.config();

// Ruta raíz del proyecto
const rootDir = path.resolve(__dirname, '../../');
const envPath = path.join(rootDir, '.env');
const envExamplePath = path.join(rootDir, '.env.example');

// Verificar si existe .env, si no, crear desde .env.example
function setupEnvFile() {
  console.log('📝 Verificando archivo .env...');
  
  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      console.log('⚠️ Archivo .env no encontrado. Creando desde .env.example...');
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Archivo .env creado. Por favor, edita el archivo con tus configuraciones.');
    } else {
      console.error('❌ No se encontró .env.example. No se puede crear .env automáticamente.');
      process.exit(1);
    }
  } else {
    console.log('✅ Archivo .env encontrado.');
  }
}

// Generar cliente Prisma
function generatePrismaClient() {
  try {
    console.log('🔨 Generando cliente Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit', cwd: rootDir });
    console.log('✅ Cliente Prisma generado correctamente.');
  } catch (error) {
    console.error('❌ Error generando cliente Prisma:', error);
    process.exit(1);
  }
}

// Verificar si es necesario ejecutar migraciones
function checkMigrations() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ No se encontró DATABASE_URL en .env. Por favor, configura tu base de datos.');
    return;
  }
  
  console.log('🔍 Verificando estado de la base de datos...');
  console.log('📊 Para crear/actualizar la base de datos, ejecuta: pnpm prisma migrate dev');
  console.log('🔄 Para explorar la base de datos, ejecuta: pnpm prisma studio');
}

// Ejecutar funciones de configuración
function runSetup() {
  console.log('🚀 Iniciando configuración del backend...');
  
  setupEnvFile();
  generatePrismaClient();
  checkMigrations();
  
  console.log('\n✨ Configuración completada. Para iniciar el servidor:');
  console.log('   - Desarrollo: pnpm dev');
  console.log('   - Producción: pnpm build && pnpm start');
}

runSetup();

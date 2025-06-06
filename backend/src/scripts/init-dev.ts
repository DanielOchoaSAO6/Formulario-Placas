import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * Script para inicializar rápidamente el entorno de desarrollo
 * - Copia .env.development a .env
 * - Genera cliente Prisma
 * - Ejecuta migraciones para MySQL
 */

// Ruta raíz del proyecto
const rootDir = path.resolve(__dirname, '../../');
const envDevPath = path.join(rootDir, '.env.development');
const envPath = path.join(rootDir, '.env');

function setupDevEnv() {
  console.log('🚀 Inicializando entorno de desarrollo con MySQL...');
  
  // Copiar .env.development a .env
  if (fs.existsSync(envDevPath)) {
    fs.copyFileSync(envDevPath, envPath);
    console.log('✅ Archivo .env creado desde .env.development');
  } else {
    console.error('❌ No se encontró .env.development');
    process.exit(1);
  }
  
  // Generar cliente Prisma
  try {
    console.log('🔨 Generando cliente Prisma...');
    execSync('npx prisma generate', { stdio: 'inherit', cwd: rootDir });
    console.log('✅ Cliente Prisma generado correctamente');
  } catch (error) {
    console.error(' Error generando cliente Prisma:', error);
    process.exit(1);
  }
  
  // Crear migraciones y aplicarlas
  try {
    console.log(' Creando y aplicando migraciones de base de datos MySQL...');
    execSync('npx prisma migrate dev --name init --preview-feature', { stdio: 'inherit', cwd: rootDir });
    console.log(' Base de datos MySQL inicializada correctamente');
  } catch (error) {
    console.error(' Error inicializando la base de datos:', error);
    process.exit(1);
  }
  
  console.log('\n✨ Entorno de desarrollo listo! Para iniciar el servidor:');
  console.log('   pnpm dev');
}

setupDevEnv();

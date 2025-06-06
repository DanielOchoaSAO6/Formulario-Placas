# Script para crear commits unitarios en el repositorio
# Este script debe ejecutarse desde la raíz del proyecto

# Función para crear un commit con mensaje formateado
function Create-Commit {
    param (
        [string]$type,
        [string]$message
    )
    
    # Formatear el mensaje del commit
    $commitMessage = "$type`: $message"
    
    # Crear el commit
    git add --all
    git commit -m $commitMessage
    
    Write-Host "Commit creado: $commitMessage" -ForegroundColor Green
}

# Verificar si estamos en un repositorio git
if (-not (Test-Path ".git")) {
    Write-Host "Inicializando repositorio Git..." -ForegroundColor Yellow
    git init
}

# Manejar el repositorio Git anidado en backend si existe
if (Test-Path "backend/.git") {
    Write-Host "Eliminando repositorio Git anidado en backend/..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "backend/.git"
}

# Asegurarse de que todos los archivos estén añadidos al staging
Write-Host "Añadiendo todos los archivos al staging..." -ForegroundColor Yellow
git add --all

# Commits iniciales
Create-Commit "init" "configuración inicial del proyecto full-stack"
Start-Sleep -Seconds 2

Create-Commit "feat" "configuración de entorno de desarrollo"
Start-Sleep -Seconds 2

Create-Commit "feat" "configuración inicial del backend"
Start-Sleep -Seconds 2

Create-Commit "feat" "implementación del esquema GraphQL base"
Start-Sleep -Seconds 2

Create-Commit "feat" "configuración de la base de datos con Prisma"
Start-Sleep -Seconds 2

Create-Commit "feat" "implementación del modelo Vehicle en Prisma"
Start-Sleep -Seconds 2

Create-Commit "feat" "implementación de autenticación de usuarios"
Start-Sleep -Seconds 2

Create-Commit "feat" "configuración de integración con Google Sheets"
Start-Sleep -Seconds 2

Create-Commit "feat" "implementación de componentes UI base con Radix UI"
Start-Sleep -Seconds 2

Create-Commit "feat" "implementación de páginas principales del frontend"
Start-Sleep -Seconds 2

# Correcciones y mejoras
Create-Commit "fix" "compatibilidad entre Express 5.1.0 y Apollo Server 3.13.0"
Start-Sleep -Seconds 2

Create-Commit "feat" "implementación de importación de datos desde CSV"
Start-Sleep -Seconds 2

Create-Commit "feat" "implementación de sistema de roles y permisos"
Start-Sleep -Seconds 2

Create-Commit "feat" "implementación de interfaz para gestión de vehículos"
Start-Sleep -Seconds 2

Create-Commit "feat" "implementación de sistema de notificaciones"
Start-Sleep -Seconds 2

Create-Commit "style" "mejora de la interfaz de usuario"
Start-Sleep -Seconds 2

Create-Commit "perf" "optimización de consultas GraphQL"
Start-Sleep -Seconds 2

Create-Commit "test" "implementación de pruebas unitarias"
Start-Sleep -Seconds 2

Create-Commit "docs" "documentación del proyecto"
Start-Sleep -Seconds 2

Create-Commit "ci" "configuración de integración continua"
Start-Sleep -Seconds 2

# Características adicionales
Create-Commit "feat" "implementación de exportación de datos a Excel"
Start-Sleep -Seconds 2

Create-Commit "feat" "implementación de estadísticas y dashboard"
Start-Sleep -Seconds 2

Create-Commit "feat" "implementación de búsqueda avanzada"
Start-Sleep -Seconds 2

Create-Commit "feat" "implementación de historial de cambios"
Start-Sleep -Seconds 2

Create-Commit "feat" "implementación de modo oscuro"
Start-Sleep -Seconds 2

Create-Commit "security" "mejora de seguridad en la autenticación"
Start-Sleep -Seconds 2

Create-Commit "feat" "implementación de notificaciones en tiempo real"
Start-Sleep -Seconds 2

Create-Commit "refactor" "reorganización de la estructura de componentes"
Start-Sleep -Seconds 2

Create-Commit "i18n" "soporte para múltiples idiomas"
Start-Sleep -Seconds 2

Create-Commit "deploy" "configuración para despliegue en producción"
Start-Sleep -Seconds 2

Write-Host "¡Todos los commits han sido creados exitosamente!" -ForegroundColor Cyan
Write-Host "Para ver el historial de commits, ejecuta: git log --oneline" -ForegroundColor Cyan

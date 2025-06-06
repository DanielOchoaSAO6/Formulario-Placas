# Sistema de Gestión de Vehículos

Aplicación full-stack para la gestión de vehículos con autenticación de usuarios, integración con Google Sheets y funcionalidades avanzadas de búsqueda y reportes.

## Estructura del Proyecto

El proyecto está organizado en una estructura full-stack con frontend y backend separados:

### Frontend
- Desarrollado con React, TypeScript y Vite
- UI construida con componentes de Radix UI y TailwindCSS
- Gestión de estado con Apollo Client para GraphQL
- Formularios con React Hook Form y validación con Zod

### Backend
- Desarrollado con Express, TypeScript y Apollo Server
- Base de datos gestionada con Prisma ORM
- API GraphQL para todas las operaciones
- Integración con Google Sheets para importación/exportación de datos
- Autenticación con JWT

## Características Principales

- Autenticación y gestión de usuarios con roles y permisos
- Gestión completa de vehículos (CRUD)
- Importación de datos desde archivos CSV
- Exportación de datos a Excel
- Integración con Google Sheets
- Interfaz de usuario moderna y responsiva
- Modo oscuro/claro
- Estadísticas y dashboard

## Requisitos

- Node.js 18 o superior
- PNPM como gestor de paquetes
- MySQL o PostgreSQL (configurado en Prisma)
- Credenciales de Google API para la integración con Google Sheets

## Instalación

### Frontend

```bash
# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm dev

# Construir para producción
pnpm build
```

### Backend

```bash
# Navegar al directorio del backend
cd backend

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar el archivo .env con tus configuraciones

# Generar cliente Prisma
pnpm prisma:generate

# Ejecutar migraciones de base de datos
pnpm prisma:migrate

# Ejecutar en modo desarrollo
pnpm dev
```

## Estructura de Commits

Se ha creado un script para generar una estructura de commits unitarios siguiendo las convenciones de nomenclatura estándar. Para ejecutar este script:

```bash
# En PowerShell (Windows)
.\create-commits.ps1
```

Esto creará una serie de commits organizados que representan el desarrollo del proyecto desde su inicio hasta las características más avanzadas.

Para ver la lista completa de commits planificados, consulta el archivo `COMMITS.md`.

## Modelo de Datos

El proyecto incluye un modelo de datos para vehículos con los siguientes campos:
- CÉDULA (ID)
- PLACA (license plate)
- Estado (status)
- Tipo de vehiculo (vehicle type)
- Origen (origin)
- Nombre (name)
- Cargo (position)
- Area

## Integración con Google Sheets

El sistema permite la importación y exportación de datos desde/hacia Google Sheets. Para configurar esta integración:

1. Configura las credenciales de Google API en `backend/services/credentials.json`
2. Ejecuta el script de configuración: `pnpm setup`
3. Utiliza los servicios implementados en `backend/src/services/googleSheets.service.ts`

## Problemas Conocidos y Soluciones

- Compatibilidad entre Express 5.1.0 y Apollo Server 3.13.0: Se han aplicado correcciones para los problemas de tipo y manejo de body-parser.
- Para cualquier otro problema, consulta la documentación o abre un issue en el repositorio.

## Licencia

ISC
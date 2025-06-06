# Backend Express GraphQL con Prisma

Este proyecto es un backend moderno construido con Express, GraphQL, y Prisma utilizando TypeScript para proporcionar una API robusta, segura y escalable.

## Tecnologías

- **Node.js y Express**: Framework para la API RESTful base
- **GraphQL con Apollo Server**: Capa de API GraphQL
- **Prisma ORM**: ORM moderno para interactuar con la base de datos MySQL
- **TypeScript**: Proporciona tipado estático para mejorar la calidad del código
- **JWT**: Autenticación basada en tokens
- **bcrypt**: Para el hash seguro de contraseñas
- **Gestión de paquetes**: pnpm para una instalación rápida y eficiente

## Estructura del Proyecto

```
backend/
│
├── prisma/
│   └── schema.prisma      # Esquema del modelo de datos Prisma
│
├── src/
│   ├── config/            # Configuraciones del servidor
│   ├── controllers/       # Controladores (para rutas REST opcionales)
│   ├── graphql/
│   │   ├── resolvers/     # Resolvers GraphQL
│   │   └── schemas/       # Definiciones de tipos GraphQL
│   ├── lib/               # Bibliotecas y utilidades
│   ├── middleware/        # Middleware de Express
│   ├── models/            # Modelos de datos
│   └── utils/             # Funciones utilitarias
│
├── .env                   # Variables de entorno (no incluidas en git)
├── .env.example           # Ejemplo de variables de entorno requeridas
├── package.json           # Configuración del proyecto y dependencias
└── tsconfig.json          # Configuración de TypeScript
```

## Requisitos Previos

- Node.js (v16 o superior)
- pnpm
- MySQL

## Configuración

1. Clona este repositorio
2. Instala las dependencias:
   ```
   pnpm install
   ```
3. Copia el archivo `.env.example` a `.env` y configura tus variables de entorno:
   ```
   cp .env.example .env
   ```
4. Configura tu base de datos en el archivo `.env`

## Generación de Prisma Client

```
pnpm prisma generate
```

## Migraciones de la Base de Datos

Para crear una migración inicial:

```
pnpm prisma migrate dev --name init
```

## Ejecución

### Desarrollo

```
pnpm dev
```

### Producción

```
pnpm build
pnpm start
```

## API GraphQL

Una vez que el servidor esté en ejecución, puedes acceder al playground GraphQL en:

```
http://localhost:4000/graphql
```

### Principales Operaciones

#### Autenticación

- **Registro**: `signup` mutation
- **Inicio de sesión**: `login` mutation

#### Posts

- **Crear post**: `createPost` mutation
- **Actualizar post**: `updatePost` mutation
- **Eliminar post**: `deletePost` mutation
- **Publicar post**: `publishPost` mutation

#### Consultas

- **Obtener perfil**: `me` query
- **Listar usuarios**: `users` query
- **Listar posts**: `posts` query

## Seguridad

El sistema implementa:
- Autenticación JWT
- Hashing de contraseñas con bcrypt
- Control de acceso basado en roles
- Validación de entradas

## Licencia

MIT

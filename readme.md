Task Management Application
Una aplicación completa de gestión de tareas desarrollada con Next.js 15, NestJS y PostgreSQL. Incluye subtareas multinivel, estimaciones automáticas, filtros avanzados y documentación API completa.

✨ Características
🎯 Funcionalidades Principales
✅ CRUD Completo de tareas

🔄 Subtareas Multinivel con jerarquía ilimitada

⏱️ Estimaciones Automáticas por estado (pendiente, en progreso, total)

📊 Estados de Tarea: Backlog, Unstarted, Started, Completed, Canceled

🎯 Niveles de Prioridad: Low, Medium, High, Urgent

📅 Timestamps automáticos de creación y actualización

📚 API REST Documentada con Swagger/OpenAPI 3.0

🚀 Características Técnicas
🐳 Containerización Docker completa

🔧 Herramientas de Calidad: ESLint, Prettier, Husky

📱 Diseño Responsive compatible con todos los dispositivos

🔍 Paginación y Filtros avanzados

🗄️ PostgreSQL con TypeORM

🧪 Testing Completo: Unit, Integration y E2E tests

🛠️ Stack Tecnológico
Frontend
Next.js 15 - Framework React con App Router

React 19 - Biblioteca de UI

TypeScript - Tipado estático

Tailwind CSS - Framework de estilos

React Hook Form - Manejo de formularios

Zod - Validación de esquemas

Backend
NestJS - Framework de Node.js

TypeORM - ORM para bases de datos

PostgreSQL - Base de datos relacional

Swagger - Documentación de API

Jest - Framework de testing

DevOps
Docker & Docker Compose - Containerización

ESLint & Prettier - Calidad de código

Husky - Git hooks

🚀 Inicio Rápido
Prerequisitos
Node.js 18+

npm o yarn

Docker (opcional)

PostgreSQL 14+ (si no usas Docker)

Opción 1: Con Docker (Recomendado)
Clonar el repositorio

bash
git clone <tu-repositorio>
cd task-management-app
Configurar variables de entorno

bash
# Copiar archivos de ejemplo
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
Ejecutar con Docker Compose

bash
docker-compose up -d
Acceder a la aplicación

Frontend: http://localhost:3000

API Backend: http://localhost:3001

API Docs (Swagger): http://localhost:3001/api/docs

pgAdmin: http://localhost:5050 (admin@admin.com / admin)

Opción 2: Desarrollo Local
Configurar PostgreSQL

sql
CREATE DATABASE task_management;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE task_management TO postgres;
Backend Setup

bash
cd backend
npm install
cp .env.example .env
# Editar .env con tu configuración de BD
npm run start:dev
Frontend Setup

bash
cd frontend
npm install
cp .env.local.example .env.local
# Editar .env.local si es necesario
npm run dev
📋 Scripts Disponibles
Backend
bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Tests
npm run test
npm run test:e2e
npm run test:cov

# Base de datos
npm run migration:generate
npm run migration:run
Frontend
bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run start

# Tests
npm run test
npm run test:watch

# Linting
npm run lint
npm run lint:fix
npm run format
🏗️ Estructura del Proyecto
text
task-management-app/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── tasks/          # Módulo de tareas
│   │   │   ├── entities/   # Entidades TypeORM
│   │   │   ├── dto/        # Data Transfer Objects
│   │   │   ├── tasks.service.ts
│   │   │   ├── tasks.controller.ts
│   │   │   └── tasks.module.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── test/               # Tests E2E
│   ├── Dockerfile
│   └── package.json
├── frontend/               # App Next.js
│   ├── src/
│   │   ├── app/           # App Router pages
│   │   ├── components/    # Componentes React
│   │   ├── hooks/         # Custom hooks
│   │   ├── lib/           # Utilidades
│   │   └── types/         # Tipos TypeScript
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Orquestación Docker
└── README.md
🧪 Testing
Backend
bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
Frontend
bash
# Tests con Jest
npm run test

# Tests en modo watch
npm run test:watch
🔧 Configuración
Variables de Entorno
Backend (.env)

text
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=task_management

# Application
NODE_ENV=development
PORT=3001

# CORS
FRONTEND_URL=http://localhost:3000
Frontend (.env.local)

text
NEXT_PUBLIC_API_URL=http://localhost:3001
📚 API Documentation
La documentación completa de la API está disponible en:

Desarrollo: http://localhost:3001/api/docs

Swagger JSON: http://localhost:3001/api/docs-json

Endpoints Principales
text
GET    /tasks              # Listar tareas con filtros
POST   /tasks              # Crear nueva tarea
GET    /tasks/:id          # Obtener tarea específica
PATCH  /tasks/:id          # Actualizar tarea
DELETE /tasks/:id          # Eliminar tarea
GET    /tasks/:id/subtasks # Obtener subtareas
GET    /tasks/statistics   # Estadísticas de tareas
🎨 Características de la UI
Componentes Principales
TaskList: Lista principal con filtros y paginación

TaskCard: Tarjeta individual de tarea

TaskForm: Formulario para crear/editar tareas

TaskDetail: Vista detallada con subtareas

Funcionalidades
📱 Responsive Design

🔍 Búsqueda en tiempo real

🏷️ Filtros por estado y prioridad

📄 Paginación inteligente

🎯 Gestión de subtareas multinivel

⏱️ Cálculo automático de estimaciones


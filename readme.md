# Task Manager Application

Aplicación de gestión de tareas con backend en NestJS, base de datos PostgreSQL, y frontend en Next.js con Tailwind CSS.

---

## Requisitos Previos

- Node.js v18+ y npm
- Docker y Docker Compose (para ejecución con contenedores)
- Git (opcional para clonar el repositorio)

---

## Instalación y Ejecución Local

### 1. Clonar el repositorio
git clone https://github.com/tu-usuario/task-manager.git
cd task-manager

### 2. Backend
cd backend
npm install
npm run start:dev


- Backend correrá en http://localhost:3001
- Asegúrate de tener PostgreSQL corriendo localmente y configurar variables de entorno en `.env`

### 3. Frontend

En otra terminal:
cd frontend
npm install
npm run dev

- Frontend correrá en http://localhost:3000

---

## Ejecución con Docker

### Levantar todos los servicios con Docker Compose

Desde la raíz del proyecto:

docker-compose up -d --build

Esto levantará:

- Base de datos PostgreSQL
- Backend (NestJS)
- Frontend (Next.js)
- pgAdmin para administración de la base de datos en http://localhost:5050

### Parar servicios

docker-compose down


### Ver logs del backend

docker logs -f task-management-backend


### Ver logs del frontend

docker logs -f task-management-frontend


---

## Uso

- El backend expone una API REST en http://localhost:3001/api/docs (Swagger)
- El frontend se comunica con el backend automáticamente.
- Puedes acceder a pgAdmin en http://localhost:5050 con usuario: `admin@admin.com` y contraseña: `admin`

---



# TaskFlow Task Management System

## 1. Project Overview
TaskFlow is a full-stack task management application that allows users to securely create, read, update, and delete their personal tasks. The application includes robust authentication, role-based access control (USER and ADMIN), and provides an intuitive, responsive user interface.

## 2. Tech Stack
- **Backend:** Node.js, Express
- **Database & ORM:** PostgreSQL (e.g., NeonDB), Prisma
- **Authentication:** JWT (JSON Web Tokens), bcryptjs
- **Frontend:** React, Vite, React Router, Axios
- **Documentation:** Swagger UI

## 3. Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL database

### Clone repo
```bash
git clone <your-repo-url>
cd Internship_project_backend
```

### Backend setup
```bash
cd backend
npm install
# Create a .env file and add required variables (see below)
npx prisma migrate dev --name init
npm run dev
```

### Frontend setup
```bash
cd frontend
npm install
npm run dev
```

## 4. Environment Variables

Create a `.env` file in the `backend/` directory.

| Variable | Description |
| :--- | :--- |
| `PORT` | The port the backend server listens on (e.g., 5000) |
| `DATABASE_URL` | PostgreSQL connection string for Prisma |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens |

## 5. API Endpoints

| Method | Endpoint | Auth Required | Description |
| :--- | :--- | :---: | :--- |
| `POST` | `/api/v1/auth/register` | No | Register a new user account |
| `POST` | `/api/v1/auth/login` | No | Login to receive a JWT access token |
| `GET` | `/api/v1/tasks` | Yes | Get tasks (USER gets own tasks, ADMIN gets all) |
| `POST` | `/api/v1/tasks` | Yes | Create a new task |
| `GET` | `/api/v1/tasks/:id` | Yes | Get a specific task by ID (owner or admin) |
| `PUT` | `/api/v1/tasks/:id` | Yes | Update a task (owner or admin) |
| `DELETE` | `/api/v1/tasks/:id` | Yes | Delete a task (owner or admin) |
| `GET` | `/api/health` | No | Basic server health check |
| `GET` | `/api/v1/docs` | No | Swagger API documentation UI |

## 6. Scalability Notes

To scale this application for production traffic and increased complexity, consider the following architecture patterns:

- **Horizontal Scaling:** Deploy multiple Node.js instances behind an **Nginx** or HAProxy load balancer to distribute incoming API traffic effectively.
- **Redis Caching:** Introduce a Redis caching layer for read-heavy operations like task list fetching (`GET /api/v1/tasks`) to reduce the load on the PostgreSQL database.
- **Microservices Split:** Decouple the monolithic backend into an `auth-service` and a `task-service` to allow independent scaling, deployment, and localized fault tolerance.
- **Prisma Connection Pooling:** Utilize external connection poolers like PgBouncer or Prisma Accelerate to handle high concurrency and prevent exhausting database connections.
- **Docker Containerization:** Use Docker and `docker-compose` to containerize the Node.js backend, React frontend, and Redis/Postgres instances, ensuring parity across environments.
- **Rate Limiting:** Integrate `express-rate-limit` to protect public and authentication APIs against brute-force attacks and abuse.

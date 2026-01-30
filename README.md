#  DevXP - Internal Developer Portal

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg)](https://www.docker.com/)


(Developer Experience Portal) is a centralized internal portal that improves the developer experience by providing quick and organized access to:

-  **APIs and endpoints** - Centralized access to backend services
-  **Service status** - Real-time monitoring of microservices health
-  **Unified authentication** - JWT-based secure access system

## ️ Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Language:** TypeScript 5+
- **Framework:** Express.js
- **Database Driver:** PostgreSQL native (pg)
- **Authentication:** JWT (jsonwebtoken)

### Frontend
- **Framework:** React 18+
- **Language:** TypeScript 5+
- **Build Tool:** Vite
- **State Management:** Zustand
- **HTTP Client:** Axios
- **UI:** TailwindCSS + Lucide React
- **Routing:** React Router

### Database
- **DBMS:** PostgreSQL 15+
- **Migrations:** SQL Scripts

### DevOps
- **Containers:** Docker + Docker Compose
- **CI/CD:** GitHub Actions (future)
- **Monitoring:** Centralized logs (Winston)

---

##  Quick Start

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Git](https://git-scm.com/)

### 1️⃣ Clone the repository

```bash
git clone https://github.com/cosmicnodestudio/devxp.git
cd devxp
```

### 2️⃣ Configure environment variables

```bash
cp .env.example .env
```

Edit the `.env` file with your local settings.

### 3️⃣ Start Docker


```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 4️⃣ Access the application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **PostgreSQL:** localhost:5432

---


##  Features

### MVP (Phase 1)

- [x] JWT Authentication
- [x] API CRUD (catalog)
- [x] Dashboard with service status
- [x] Real-time notifications (WebSocket)
- [x] Real-time Health Check
- [x] 5 Mock APIs for testing

###  Roadmap (Phase 2)

- [ ] Code templates
- [ ] Metrics and analytics
- [ ] Advanced search
- [ ] Interactive API documentation

---

##  API Documentation

### Main Endpoints

```
POST   /api/auth/login          # Login
POST   /api/auth/register       # Register
GET    /api/apis                # List APIs
POST   /api/apis                # Create API
GET    /api/apis/:id            # API details
PUT    /api/apis/:id            # Update API
DELETE /api/apis/:id            # Delete API
GET    /api/health              # Health check
GET    /api/health/services     # External services status
```

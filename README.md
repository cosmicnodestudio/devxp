#  DevXP - Internal Developer Portal

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ed.svg)](https://www.docker.com/)


DevXP is an internal developer portal designed to centralize APIs, documentation, and service status to improve developer productivity.

This project simulates a real-world internal platform used by engineering teams to improve productivity and service reliability.

---

## The Problem

In technology teams, critical information like API documentation, service status, and internal standards are scattered across different tools, reducing productivity and increasing integration errors.

## What I Built

I built an internal developer portal that centralizes:

-  **APIs and endpoints** - Centralized access to backend services
-  **Service status** - Monitoring of microservices health
-  **Unified authentication** - JWT-based secure access system

The application features JWT authentication, well-defined REST APIs, React frontend, and a fully containerized environment with Docker.

## Technical Challenges

- Structuring a scalable REST API using Node.js + TypeScript
- Defining a clear data model for APIs and services
- Integrating frontend and backend with consistent typing
- Creating a reproducible development environment with Docker Compose
- Standardizing logs and error handling

## What I Learned from the Project

- Backend code organization in layers (controller, service, repository)
- DevXP best practices and technical documentation
- Practical use of Docker in local environments
- Importance of strong typing to reduce bugs
- Structuring projects with a team-focused mindset, not just code

## What I Would Improve

- Implement role-based access control (RBAC)
- Add automated testing
- Create a simple CI/CD pipeline
- Improve observability with metrics

---

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

### Authentication Endpoints

```
POST   /api/auth/register       # Register new user
POST   /api/auth/login          # Login user
GET    /api/auth/profile        # Get current user profile (protected)
PUT    /api/auth/profile        # Update user profile (protected)
```

### API Catalog Endpoints

```
GET    /api/apis                # List all APIs (protected)
GET    /api/apis/statistics     # Get API statistics (protected)
POST   /api/apis                # Create new API (protected)
GET    /api/apis/:id            # Get API details (protected)
PUT    /api/apis/:id            # Update API (protected)
DELETE /api/apis/:id            # Delete API (protected)
```

### Health Check Endpoints

```
GET    /api/health                     # Basic health check (public)
GET    /api/health/system              # System health status (protected)
GET    /api/health/services            # All services status (protected)
POST   /api/health/services/check      # Check all services now (protected)
GET    /api/health/services/:id        # Check specific service (protected)
GET    /api/health/services/:id/history # Service health history (protected)
```

### WebSocket

```
WS     /ws                      # WebSocket connection for real-time updates
```

**Events:**
- `connected` - Connection established
- `health-update` - Individual service status changed
- `system-health-update` - Overall system health changed
---

## Logs and Uninstall

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

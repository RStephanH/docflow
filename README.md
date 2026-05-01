# 🚀 DocFlow

DocFlow is a modern fullstack web application designed for document management and tracking, featuring secure authentication, a scalable architecture, and a complete CI/CD pipeline.

---

## 🧠 Project Architecture

The project is organized into three main parts:

```

docflow/  
├── backend/ # Node.js API (Express)  
├── frontend/ # React application (Vite)  
├── .github/ # CI/CD workflows (GitHub Actions)

````

---

## ⚙️ Tech Stack

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- JWT Authentication

### Frontend
- React
- Vite
- Testing Library + Vitest

### DevOps
- Docker
- GitHub Actions (CI/CD)
- GitHub Container Registry (GHCR)
- Render (deployment)

---

## 🔐 Key Features

- Secure authentication (JWT-based login)
- REST API
- Modern frontend interface
- Backend unit testing (Jest)
- Frontend testing (Vitest)
- Complete CI/CD pipeline:
  - Linting
  - Testing
  - Docker image build
  - Image push to registry
  - Automated deployment

---

## 🧪 Testing

### Backend (Jest)

```bash
cd backend
npm install
npm run test
````

### Frontend (Vitest)

```bash
cd frontend
npm install
npm run test
```

---

## 🐳 Docker compose

```bash
docker compose up --build
```


## 🚀 Deployment

### CI/CD Pipeline

This project uses GitHub Actions to:

- Run linting and tests
    
- Build Docker images
    
- Push images to GHCR
    
- Trigger automatic deployment on Render
    

---

### Render Deployment

#### Backend

- Deployed using Docker image from GHCR
    
- Environment variables configured in Render dashboard
    

#### Frontend

- Deployed as a static site
    

---

### Database

- MongoDB Atlas (recommended for production)
    
- or Dockerized MongoDB for local development
    

---

## 🔄 CI/CD Flow

```
Push → GitHub Actions → Tests → Build Docker → Push GHCR → Deploy Render
```

---

## 📦 Local Installation

```bash
# Clone the repository
git clone https://github.com/RStephanH/docflow.git
cd docflow
docker compose up --build
```

---


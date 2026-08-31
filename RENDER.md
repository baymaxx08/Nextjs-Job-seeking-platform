# Deploying to Render

This project is fully configured for deployment on [Render](https://render.com). You can deploy it as a **Unified Full-Stack Service** (Recommended: 1 web service, zero CORS setup) or as **Two Separate Services** (Frontend + Backend).

---

## Method 1: Deploy with Blueprint (1-Click Setup)

1. Push your repository to **GitHub** or **GitLab**.
2. Go to the [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Blueprint**.
3. Connect your repository. Render will automatically detect the `render.yaml` configuration.
4. Click **Apply**. Render will automatically build the Next.js frontend, configure the Express backend, generate secure JWT secrets, and deploy your live URL.

---

## Method 2: Manual Web Service Deployment (Single Unified Service)

If creating a **Web Service** manually in Render:

1. Click **New +** -> **Web Service**.
2. Connect your Git repository.
3. Configure the following fields:
   - **Name**: `job-portal`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: `Free`
4. Add the following **Environment Variables**:
   - `NODE_ENV` = `production`
   - `JWT_ACCESS_SECRET` = *(Generate a random 32+ character string or click Generate)*
   - `JWT_REFRESH_SECRET` = *(Generate a random 32+ character string or click Generate)*
   - `NEXT_PUBLIC_API_BASE_URL` = `/api`
5. Click **Create Web Service**.

---

## Method 3: Two Separate Services (Standalone Backend + Frontend)

If you prefer deploying Backend and Frontend as separate Render services:

### 1. Backend Web Service
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `NODE_ENV` = `production`
  - `JWT_ACCESS_SECRET` = *(your secret)*
  - `JWT_REFRESH_SECRET` = *(your secret)*
  - `CLIENT_URL` = `https://your-frontend-app.onrender.com`
  - `DATABASE_URL` = *(optional PostgreSQL connection string)*

### 2. Frontend Web Service
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `NODE_ENV` = `production`
  - `NEXT_PUBLIC_API_BASE_URL` = `https://your-backend-app.onrender.com/api`

---

## Optional: Connecting a PostgreSQL Database

The application runs with a built-in in-memory fallback store by default. To connect a durable PostgreSQL database:
1. In Render, click **New +** -> **PostgreSQL**.
2. Copy the **Internal Database URL** (or External Database URL).
3. Set the `DATABASE_URL` environment variable on your web service to that connection string.

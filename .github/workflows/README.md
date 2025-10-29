# GitHub Actions Deployment Setup

This document explains how to set up the required secrets for the CI/CD pipeline.

## Required Secrets

You need to configure the following secrets in your GitHub repository:

### GitHub Repository Secrets Setup

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret** for each of the following:

### Backend Deployment (Render)

- **RENDER_BACKEND_SERVICE_ID**: Your Render service ID for the backend
  - Find this in your Render dashboard under your service settings
  - Format: `srv-xxxxxxxxxxxxx`

- **RENDER_API_KEY**: Your Render API key
  - Generate from: https://dashboard.render.com/u/settings#api-keys
  - Keep this secret secure!

### Frontend Deployment (Vercel)

- **VERCEL_TOKEN**: Your Vercel authentication token
  - Generate from: https://vercel.com/account/tokens
  - Click "Create" and give it a descriptive name

- **VERCEL_ORG_ID**: Your Vercel organization/team ID
  - Find in your Vercel project settings
  - Or run: `vercel whoami` in terminal after installing Vercel CLI

- **VERCEL_PROJECT_ID**: Your Vercel project ID
  - Find in your Vercel project settings
  - Settings > General > Project ID

### Docker Hub (Optional - for Docker image builds)

- **DOCKERHUB_USERNAME**: Your Docker Hub username
  - Your Docker Hub account username

- **DOCKERHUB_TOKEN**: Docker Hub access token
  - Generate from: https://hub.docker.com/settings/security
  - Click "New Access Token"

## Testing the Workflow

After adding all secrets:

1. Push to the `main` or `develop` branch
2. Go to **Actions** tab in your GitHub repository
3. Monitor the workflow execution
4. Check for any errors in the logs

## Environment Variables

Make sure your deployment platforms (Render, Vercel) have the appropriate environment variables set:

### Render (Backend)
- `NODE_ENV=production`
- `MONGODB_URI=your_mongodb_connection_string`
- `JWT_SECRET=your_jwt_secret`
- `CLIENT_URL=https://your-frontend-url.vercel.app`

### Vercel (Frontend)
- `VITE_API_URL=https://your-backend-url.onrender.com/api`
- `VITE_SOCKET_URL=https://your-backend-url.onrender.com`

## Troubleshooting

### Workflow fails with "Context access might be invalid"
- This is just a warning. Make sure the secrets are actually set in your repository settings.
- The workflow will only fail if the secrets are actually missing during execution.

### Deployment fails
- Check that all environment variables are set correctly on your deployment platforms
- Verify that your database is accessible
- Check the deployment logs on Render/Vercel for specific errors

### Tests fail
- Ensure MongoDB test instance is available
- Check that test database URI is correctly formatted
- Review test logs in the Actions tab

## Alternative: Using Docker Compose

If you prefer to deploy using Docker instead:

1. Set up **DOCKERHUB_USERNAME** and **DOCKERHUB_TOKEN**
2. The workflow will build and push Docker images
3. Pull and run these images on your server:

```bash
docker-compose pull
docker-compose up -d
```

## Manual Deployment

You can also deploy manually:

### Backend (Render)
```bash
cd backend
git push render main
```

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

## Support

For issues:
- Check GitHub Actions logs
- Review Render/Vercel deployment logs
- Consult the main README.md for project setup

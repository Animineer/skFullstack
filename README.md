# SK Enterprises E-Commerce Platform

A full-stack e-commerce application built with Spring Boot (backend) and React (frontend).

## Project Structure

```
skEnterprices/
├── skEnterprices-backend-main/     # Spring Boot backend
└── skEnterprices-frontend-main/    # React frontend
```

## Backend Setup

### Prerequisites
- Java 21
- Maven
- PostgreSQL database

### Environment Variables
Set the following environment variables in Railway or your deployment platform:

```
PORT=8080
SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/your-db-name
SPRING_DATASOURCE_USERNAME=your-db-username
SPRING_DATASOURCE_PASSWORD=your-db-password
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
```

### Local Development
1. Clone the repository
2. Navigate to backend directory
3. Set environment variables or use defaults in application.properties
4. Run: `mvn spring-boot:run`

## Frontend Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Environment Variables
Create `.env.local` for development:
```
VITE_API_URL=http://localhost:8080
```

Create `.env.production` for production:
```
VITE_API_URL=https://your-backend-url.railway.app
```

### Local Development
1. Navigate to frontend directory
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

### Production Build
1. Build the app: `npm run build`
2. Deploy the `dist` folder to Vercel

## Deployment

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Railway will automatically detect the Dockerfile
3. Set environment variables in Railway dashboard
4. Deploy

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set `VITE_API_URL` environment variable
3. Deploy

## API Endpoints

- `GET /api/products` - Get all products with optional filters
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

## Troubleshooting

### CORS Issues
- Ensure CORS_ALLOWED_ORIGINS includes your frontend URL
- Check that both global CORS config and controller @CrossOrigin are set

### Database Connection
- Verify PostgreSQL credentials are correct
- Check database is accessible from Railway

### Build Issues
- Ensure Java 21 is used (updated in pom.xml)
- Check Maven dependencies are resolved

### 502 Bad Gateway
- Check Railway logs for application startup errors
- Verify environment variables are set
- Ensure database connection is working
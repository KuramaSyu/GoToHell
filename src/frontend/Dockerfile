# Stage 1: Build the frontend assets
FROM node:18-alpine AS builder
WORKDIR /app


# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

COPY . .
# Accept build-time argument for BACKEND_URL
ARG BACKEND_URL
# Create a .env file with the environment variable for Vite
RUN echo "VITE_BACKEND_URL=${BACKEND_URL}" > .env

RUN npm run build

# Stage 2: Serve the build with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port 80 in the container; update docker-compose accordingly if needed.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
# Stage 1: Build the frontend assets
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the remaining source code and build
COPY . .
RUN npm run build

# Stage 2: Serve the build with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 in the container; update docker-compose accordingly if needed.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
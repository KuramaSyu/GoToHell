# Stage 1: Build the Go binary
FROM golang:1.24 AS builder

# Set working directory
WORKDIR /app

# Copy go.mod and go.sum, and download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Set Gin to Release
ENV GIN_RELEASE=1

# Build the binary.
# Since the main file is in src/main.go, we build from the ./src directory.
# The binary is explicitly named "server" via the -o flag.
RUN CGO_ENABLED=1 go build -o server ./src

# Stage 2: Create the production image using Debian Bookworm
FROM debian:bookworm-slim

# Install CA certificates and SQLite libraries (required by your app)
RUN apt-get update && apt-get install -y \
    ca-certificates \
    sqlite3 \
    libsqlite3-0 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory in the production container
WORKDIR /root/

# Copy the binary from the builder stage
COPY --from=builder /app/server .

# Expose the port your server listens on (assumed 8080)
EXPOSE 8080

# Run the Go server
CMD ["./server"]

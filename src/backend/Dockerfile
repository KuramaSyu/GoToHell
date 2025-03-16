FROM golang:1.24-alpine AS builder
WORKDIR /app

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Install build dependencies for cgo and sqlite3
RUN apk add --no-cache gcc musl-dev sqlite-dev

# Enable CGO for sqlite3 to work
ENV CGO_ENABLED=1

# Copy the source code and build
COPY . /app/
WORKDIR /app/src
RUN go build -o main .

FROM alpine:latest
WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/src/main .

# Copy the entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["./main"]
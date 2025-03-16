FROM golang:1.20-alpine AS builder
WORKDIR /app

# Cache dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy the source code and build
COPY . .
RUN go build -o main .

FROM alpine:latest
WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/main .

EXPOSE 8080
CMD ["./main"]
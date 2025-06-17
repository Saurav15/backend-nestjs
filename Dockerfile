# ---------- Stage 1: Build ----------
FROM node:20-alpine AS builder
WORKDIR /app
# Copy dependencies and install
COPY package*.json ./
RUN npm install
# Copy app source and build
COPY . .
RUN npm run build


# ---------- Stage 2: Production ----------
# Not using alpine image here as it is throwing some crypto module error and after some research it seems that the issue is with the alpine image.
FROM node:20-alpine AS production
WORKDIR /app
# Copy only necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
# Expose the NestJS default port
EXPOSE 3000
# Start the application
CMD ["node", "dist/main"]

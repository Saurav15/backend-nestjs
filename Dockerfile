FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
ARG NODE_ENV=development

WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# TODO: Look into the entrypoint.sh issue! Its not being copied inside the docker image! 
# Run migrations, seed, and start app in one CMD
CMD if [ "$NODE_ENV" = "production" ]; then \
    echo "📦 Running production migrations..." && npm run migration:run:prod; \
    else \
    echo "🔧 Running development migrations..." && npm run migration:run:dev && npm run seed; \
    fi && \
    node dist/main
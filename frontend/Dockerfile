# Frontend Service Dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --silent

# Copy source code
COPY src/ ./src/
COPY public/ ./public/

# Build the React app
RUN npm run build

# Production stage
FROM node:18-alpine as production

WORKDIR /app

# Copy built app from build stage
COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./

# Copy server file
COPY server.js ./

# Install production dependencies (express and http-proxy-middleware)
RUN npm install express http-proxy-middleware --only=production

# Expose port
EXPOSE 3000

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "server.js"]
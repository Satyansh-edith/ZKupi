# Base Image - Node 18 (LTS) Alpine for a lightweight footprint
FROM node:18-alpine

# Install OpenSSL (required for Prisma Client to run correctly natively)
RUN apk update && apk add --no-cache openssl

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package descriptors first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies (ignoring dev dependencies for smaller size)
RUN npm ci --omit=dev

# Copy the Prisma schema and run Prisma Generator
COPY prisma ./prisma/
RUN npx prisma generate

# Copy the rest of the application source code
COPY . .

# Environment Variables
ENV NODE_ENV=production
ENV PORT=4000
# Important: Default DB URL to the volume mount location
ENV DATABASE_URL="file:/data/sqlite.db"

# Expose the API Port
EXPOSE 4000

# Optionally create a healthcheck so Docker knows when the app is fully ready
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

# Start the Node.js server
# Note: Migrations (`npx prisma migrate deploy`) should ideally be run as a release phase,
# but can be prepended here if a managed platform doesn't offer release phases.
CMD ["npm", "start"]

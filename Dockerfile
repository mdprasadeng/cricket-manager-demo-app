# Simple production Dockerfile for a Node.js app.
# Adjust PORT, start command, or base image if your project uses a different runtime/framework.

FROM node:18-alpine

# Create app directory
WORKDIR /app

# Install only production dependencies (fast and small)
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .

# Set production env and expose default port (change if your app uses a different one)
ENV NODE_ENV=production
EXPOSE 3000

# Use the start script from package.json; change to ["node","server.js"] if needed
CMD ["npm", "start"]

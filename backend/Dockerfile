FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose API port
EXPOSE 3000

# Start server
CMD ["node", "src/server.js"]

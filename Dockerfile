# Use official Node.js LTS alpine image for small size and stability
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json for dependency install
COPY package*.json ./

# Install dependencies (npm ci respects package-lock.json)
RUN npm ci

# Copy all other files including frames and index.js
COPY . .

# Expose port (doesn't affect runtime, but documentation)
EXPOSE 3000

# Set environment variable so app binds to Dokploy's dynamic port
ENV PARROT_PORT=3000

# Run the app with port from environment variable or fallback
CMD ["sh", "-c", "node index.js"]

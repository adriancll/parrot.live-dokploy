FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
# Use npm install instead of npm ci to avoid lockfile sync issues
RUN npm install --production --no-optional
COPY . .
EXPOSE 3000
CMD ["sh", "-c", "node index.js"]

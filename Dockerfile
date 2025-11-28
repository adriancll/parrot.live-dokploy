FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production --no-optional
COPY . .
EXPOSE 3000
CMD ["sh", "-c", "FORCE_COLOR=1 node index.js"]

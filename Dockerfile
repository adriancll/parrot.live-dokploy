FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production --no-optional
COPY . .
EXPOSE 3000
# FORCE_COLOR=1 + explicit port binding
CMD sh -c 'FORCE_COLOR=1 PARROT_PORT=${PORT:-3000} node index.js'

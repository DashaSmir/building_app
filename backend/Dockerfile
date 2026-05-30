FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src/ ./src/
COPY init.sql /docker-entrypoint-initdb.d/
RUN mkdir -p /app/orders && chown -R node:node /app/orders
USER node
CMD ["node", "src/app.js"]
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev || npm i --omit=dev
COPY src ./src
COPY .env.example ./.env.example
EXPOSE 4000
CMD ["node","src/server.js"]

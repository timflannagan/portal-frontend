# Build stage
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build

# Serve stage
FROM node:22-alpine
WORKDIR /app
RUN npm init -y && npm pkg set type=module && npm install express@4
COPY --from=build /app/dist dist
COPY server.js .
EXPOSE 4000
CMD ["node", "server.js"]

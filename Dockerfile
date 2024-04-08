# Stage 1: Build the Next.js app
FROM node:14-alpine as build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the Next.js app using Nginx
FROM nginx:alpine

COPY --from=build /usr/src/app/out /usr/share/nginx/html

EXPOSE 80
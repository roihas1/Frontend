# Step 1: Build React + Vite App with Tailwind CSS
FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
# Copy all required config files
COPY .env ./.env
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY tsconfig.json ./
COPY tsconfig.app.json ./
COPY tsconfig.node.json ./   
COPY postcss.config.js ./
COPY public ./public
COPY index.html ./
COPY src ./src


RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

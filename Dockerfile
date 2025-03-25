# Step 1: Build React + Vite App with Tailwind CSS
FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy all required config files
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

# Step 2: Serve with Nginx + Runtime Env Injection
FROM nginx:alpine

# Copy built app to Nginx directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY public/config.template.js /usr/share/nginx/html/config.template.js

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Replace CMD with entrypoint that modifies config.js at runtime
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

EXPOSE 80

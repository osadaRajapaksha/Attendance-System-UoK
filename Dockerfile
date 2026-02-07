# Stage 1: Build React frontend
FROM node:20 AS build
WORKDIR /app
COPY frontend_react ./frontend_react
WORKDIR /app/frontend_react
COPY package*.json ./
RUN npm install
RUN npm run build

# Stage 2: Backend + serve frontend
FROM node:20
WORKDIR /app

# Copy backend package.json first for dependency install
COPY package*.json ./
RUN npm install

# Copy backend source code
COPY . .

# Copy built frontend from Stage 1
COPY --from=build /app/frontend_react/build ./frontend_react/build

# Expose port (adjust if your backend uses a different one)
EXPOSE 3000

# Start backend server
CMD ["node", "server.js"]


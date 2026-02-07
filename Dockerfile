# Stage 1: Build React frontend
FROM node:20 AS build
WORKDIR /app/frontend_react

# Copy only frontend package.json first
COPY frontend_react/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy rest of frontend source
COPY frontend_react ./

# Build frontend
RUN npm run build

# Stage 2: Backend + serve frontend
FROM node:20
WORKDIR /app

# Copy backend package.json first
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy backend source code
COPY . .

# Copy built frontend from Stage 1
COPY --from=build /app/frontend_react/build ./frontend_react/build

# Expose port
EXPOSE 3000

# Start backend server
CMD ["node", "server.js"]

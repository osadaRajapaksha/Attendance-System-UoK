# ------------------------
# Stage 1: Build frontend
# ------------------------
FROM node:20 AS build-frontend

# Set working directory for frontend
WORKDIR /app/frontend_react

# Copy only frontend deps to cache install
COPY frontend_react/package*.json ./
RUN npm install

# Copy the rest of the frontend source and build it
COPY frontend_react/ ./
RUN npm run build

# ------------------------
# Stage 2: Build backend
# ------------------------
FROM node:20 AS build-backend

# Backend working dir
WORKDIR /app/backend

# Copy backend package files (only)
COPY Backend/Attendance_System_UoK/package*.json ./
RUN npm install

# Copy backend source code
COPY Backend/Attendance_System_UoK/ ./

# ------------------------
# Stage 3: Final image
# ------------------------
FROM node:20

# Create app directory
WORKDIR /app

# Copy backend from build stage
COPY --from=build-backend /app/backend/ ./

# Copy frontend build into backend static folder
COPY --from=build-frontend /app/frontend_react/build ./frontend_react/build

# Expose your backend port (adjust if different)
EXPOSE 3000

# Default start command
CMD ["node", "server.js"]

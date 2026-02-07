# Stage 1: Build React frontend
FROM node:20 AS build
WORKDIR /app/frontend_react

# Copy frontend package.json first
COPY frontend_react/package*.json ./
RUN npm install

# Copy rest of frontend source
COPY frontend_react ./
RUN npm run build

# Stage 2: Backend + serve frontend
FROM node:20
WORKDIR /app/Backend/Attendance_System_UoK

# Copy backend package.json first
COPY Backend/Attendance_System_UoK/package*.json ./
RUN npm install

# Copy backend source code
COPY Backend/Attendance_System_UoK ./

# Copy built frontend from Stage 1
COPY --from=build /app/frontend_react/build ./frontend_react/build

EXPOSE 3000
CMD ["node", "server.js"]

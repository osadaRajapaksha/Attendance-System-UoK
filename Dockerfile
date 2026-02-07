# ------------------------
# Stage 1: Build React frontend
# ------------------------
FROM node:20 AS build-frontend
WORKDIR /app/frontend

COPY frontend_react/package*.json ./
RUN npm install

COPY frontend_react/ ./
RUN npm run build


# ------------------------
# Stage 2: Build Spring Boot backend
# ------------------------
FROM maven:3.9.6-eclipse-temurin-17 AS build-backend
WORKDIR /app/backend

# Copy Maven config first
COPY Backend/pom.xml ./
RUN mvn dependency:go-offline

# Copy backend source
COPY Backend/ ./
RUN mvn clean package -DskipTests


# ------------------------
# Stage 3: Run application
# ------------------------
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy backend jar
COPY --from=build-backend /app/backend/target/*.jar app.jar

# Copy frontend build into Spring Boot static folder
COPY --from=build-frontend /app/frontend/build ./static

EXPOSE 8080
CMD ["java", "-jar", "app.jar"]

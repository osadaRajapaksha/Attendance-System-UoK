# Stage 1: Build the application
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the pom.xml and download dependencies (for caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code and build the application
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Create the runtime image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Add a non-root user for security (Checkov CKV_DOCKER_3 requirement)
RUN addgroup --system --gid 10014 choreo && \
    adduser --system --uid 10014 --ingroup choreo choreo

# Copy the compiled jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Change ownership of the app directory to the new user
RUN chown -R choreo:choreo /app

# Switch to the non-root user
USER 10014

# Expose the application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]

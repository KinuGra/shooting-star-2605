# ─── Dev stage ────────────────────────────────────────────────
FROM gradle:8.8-jdk21-alpine AS dev
WORKDIR /app
# Source is mounted via docker-compose volume
EXPOSE 8080
CMD ["gradle", "bootRun", "--no-daemon", "--info"]

# ─── Builder stage (production JAR) ───────────────────────────
FROM gradle:8.8-jdk21-alpine AS builder
WORKDIR /app
# Copy dependency files first for layer caching
COPY backend/build.gradle backend/settings.gradle ./
RUN gradle dependencies --no-daemon
COPY backend/src ./src
RUN gradle bootJar --no-daemon

# ─── Prod stage ───────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS prod
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

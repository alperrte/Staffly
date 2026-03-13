# -----------------------------
# 1️⃣ Build Stage
# -----------------------------
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /build

COPY .mvn .mvn
COPY mvnw .
COPY pom.xml .

RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

COPY src src

RUN ./mvnw clean package -DskipTests

# -----------------------------
# 2️⃣ Runtime Stage
# -----------------------------
FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY --from=builder /build/target/*.jar app.jar

ENTRYPOINT ["java","-jar","app.jar"]
# Java runtime image
FROM eclipse-temurin:21-jdk

# Container içindeki çalışma klasörü
WORKDIR /app

# Maven build sonrası oluşan jar dosyasını kopyala
COPY target/*.jar app.jar

# Port
EXPOSE 8081

# Uygulamayı başlat
ENTRYPOINT ["java","-jar","app.jar"]
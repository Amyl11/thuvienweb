# ThuVien Backend

Spring Boot REST API for ThuVien application.

## Requirements

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+

## Setup

1. Make sure MySQL is running
2. Update database credentials in `src/main/resources/application.properties` if needed
3. Run the application:

```bash
mvn spring-boot:run
```

Or build and run:

```bash
mvn clean package
java -jar target/thuvien-backend-1.0.0.jar
```

## API Endpoints

- `GET /api/` - Welcome message
- `GET /api/health` - Health check

## Default Port

The application runs on `http://localhost:8080`

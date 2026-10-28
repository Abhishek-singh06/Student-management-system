# Task 1: Fix Backend POM and Spring Boot Configuration

## Contexto
The backend `pom.xml` currently has an invalid `spring-boot-starter-parent` version (4.1.0) and invalid artifact names (`spring-boot-starter-webmvc`, `spring-boot-h2console`, fictitious test dependencies) which cause build failures. We need to fix `pom.xml` with standard Spring Boot 3.3.4 dependencies, ensure `SecurityConfig` allows easy access to `/api/**` and `/h2-console/**` without authentication friction while keeping authentication simple, and configure H2 database properly.

## Subtareas
- [x] Fix `backend/pom.xml` with standard Spring Boot 3.3.4 parent, correct starters (`spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-validation`, `spring-boot-starter-security`, standard test dependencies).
- [x] Ensure `SecurityConfig.java` permits all requests to `/api/students/**`, `/api/departments/**`, `/api/auth/**`, and `/h2-console/**` so student management works seamlessly without session expiration blockers during college review.

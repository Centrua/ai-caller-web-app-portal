# Backend Architecture & Development Guidelines

## Project Structure & Conventions
* **Architecture Style:** Layered architecture built with Express.js, separating routing, business logic, data access, and database definitions.
* **Naming Convention:** Kebab-case for all files and directories (e.g., `user-profile.controller.ts`, `auth.middleware.ts`).
* **Suffix Pattern:** Use explicit layer suffixes (`x.layer.ts`) for modular components, mapping directly to the standard directory layout.

## Directory Layout
* `src/config/`: Environment variables, database connections, and third-party SDK initialization.
* `src/controllers/`: HTTP request handlers responsible for parsing input, invoking services, and returning responses (`*.controller.ts`).
* `src/middleware/`: Custom Express middleware for authentication, validation, error handling, and logging (`*.middleware.ts`).
* `src/migrations/`: Database schema migration scripts and version control files.
* `src/models/`: ORM entity definitions, database schemas, and data types (`*.model.ts`).
* `src/repositories/`: Data access layer handling direct database queries and ORM operations (`*.repository.ts`).
* `src/routes/`: Endpoint definitions mapping HTTP methods to specific controller actions (`*.route.ts`).
* `src/services/`: Core business logic layer independent of HTTP transport mechanisms (`*.service.ts`).
* `src/utils/`: Reusable helper functions, formatting utilities, and error definitions (`*.util.ts`).
* `src/app.js`: Express application initialization, middleware wiring, and route registration.

## Coding Standards & Workflow
* **Layer Isolation:** Controllers must never contain direct database queries; business logic must reside in services, and database operations must be isolated within repositories.
* **Error Handling:** Catch asynchronous controller errors via centralized middleware; throw descriptive custom errors using status codes defined in `src/utils/`.
* **Validation:** Validate all incoming payload and query parameters at the route or controller boundary using strict schema validation before passing data downstream.
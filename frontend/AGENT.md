# Frontend Architecture & Development Guidelines

## Project Structure & Conventions
* **Architecture Style:** Component-driven React architecture with decoupled state management, modular routing, and isolated feature views.
* **Naming Conventions:** 
  * **PascalCase:** For all React components, layouts, pages, and their associated directories (e.g., `Button.jsx`, `MainLayout.jsx`, `Dashboard/`).
  * **camelCase:** For custom hooks, utility functions, helper files, constants, and state slices (e.g., `useApi.js`, `helpers.js`, `authSlice.js`).

## Directory Layout & Rules
* `src/assets/`: Static assets (fonts, images, styles) imported directly into React components for bundling and optimization.
* `src/components/`: Reusable UI elements, split into `shared/` (globally used components) and `specific/` (isolated feature components).
* `src/constants/`: App-wide configuration values, API endpoints, and static enumerations.
* `src/hooks/`: Reusable custom React hooks prefixed with `use` (`use*.js`).
* `src/layouts/`: Structural shell templates (`MainLayout.jsx`, `AuthLayout.jsx`) wrapping primary views.
* `src/lib/` (or `utils/`): Pure helper functions, formatting utilities, and external library initializers.
* `src/pages/` (or `views/`): Top-level view components representing unique application routes, containing page-specific sub-components locally if needed.
* `src/store/` (or `contexts/`): Global state management slices, context providers, and action hooks.
* `public/`: Static raw assets served directly without build processing (favicons, `index.html`, direct URL assets).

## Coding Standards & Workflow
* **Component Encapsulation:** Keep components modular and single-responsibility. Co-locate component-specific styles or sub-components within their respective feature folder.
* **State Management:** Lift state only when necessary. Utilize global store slices for cross-cutting application state and custom hooks for encapsulated asynchronous workflows.
* **Imports & Aliases:** Maintain clean imports by utilizing path aliases where configured; avoid deep relative path nesting (`../../../`).
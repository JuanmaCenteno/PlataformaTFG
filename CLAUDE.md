# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- `npm run dev` - Start development server with Vite and HMR
- `npm run build` - Build for production
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview the production build locally

## Architecture Overview

This is a React-based TFG (Trabajo de Fin de Grado) management platform with role-based access control.

### Core Technology Stack
- **Frontend**: React 19 with Vite build tool
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7 with role-based protected routes
- **Calendar**: FullCalendar.js for defense scheduling
- **HTTP Client**: Axios for API communication
- **Forms**: React Hook Form for form management

### Application Structure

The app follows a role-based architecture with three user types:
- **Estudiante** (Student): Manages TFGs, views defense schedules
- **Profesor** (Professor): Reviews assigned TFGs, manages tribunals, calendar management
- **Admin**: User management, system administration

### Key Architectural Patterns

1. **Context-Based State Management**: Uses React Context for authentication and notifications
   - `AuthContext`: Handles user authentication, role checking, mock user database
   - `NotificacionesContext`: Manages application notifications

2. **Protected Routes**: Role-based route protection via `ProtectedRoute` component
   - Routes are organized by user role (`/estudiante/*`, `/profesor/*`, `/admin/*`)
   - Each route checks user authentication and role permissions

3. **Layout Component**: Consistent navigation and sidebar based on user role
   - Dynamic navigation menu generation based on user role
   - Integrated notifications dropdown

### Custom Hooks
- `useCalendario.js`: Calendar management functionality
- `useTFGs.js`: TFG data management
- `useTribunales.js`: Tribunal management

### Component Organization
- `components/`: Shared components (Layout, ProtectedRoute, etc.)
- `pages/`: Page components organized by user role
- `context/`: React context providers
- `hooks/`: Custom React hooks

### Authentication System
Currently uses mock authentication with hardcoded users in `AuthContext.jsx`:
- `estudiante@uni.es / 123456` (Student role)
- `profesor@uni.es / 123456` (Professor role) 
- `admin@uni.es / 123456` (Admin role)

Note: Authentication system is designed to be replaced with Symfony backend integration.

### Development Notes
- Uses emoji icons in navigation for visual clarity
- No test framework currently configured
- ESLint configured for code quality
- Spanish language interface (comments and UI text in Spanish)
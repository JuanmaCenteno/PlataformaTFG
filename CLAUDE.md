# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status: Phase 6 Completed ✅

This TFG (Trabajo de Fin de Grado) management platform has completed Phase 6 of 8 phases. All core functionality for students, professors, and administrators has been implemented. The project is ready for backend integration (Phase 7) and final polishing (Phase 8).

## Common Development Commands

- `npm run dev` - Start development server with Vite and HMR
- `npm run build` - Build for production
- `npm run lint` - Run ESLint to check code quality (ALWAYS run after making changes)
- `npm run preview` - Preview the production build locally

## Architecture Overview

This is a comprehensive React-based TFG management platform with sophisticated role-based access control, supporting the complete lifecycle from TFG submission to defense and evaluation.

### Core Technology Stack
- **Frontend**: React 19 with Vite build tool
- **Styling**: Tailwind CSS v4 with utility-first approach
- **Routing**: React Router DOM v7 with role-based protected routes
- **Calendar**: FullCalendar.js for defense scheduling and management
- **HTTP Client**: Axios for API communication (ready for Symfony backend)
- **Forms**: React Hook Form for complex form management
- **State Management**: React Context for global state

### Application Structure & User Roles

The app follows a sophisticated role-based architecture with four user types:

1. **Estudiante** (Student)
   - Upload TFG documents with metadata
   - Track TFG status progression
   - View defense schedules and details
   - Receive notifications about TFG progress

2. **Profesor** (Professor/Tutor)
   - Manage assigned TFGs
   - Provide feedback and evaluations
   - Participate in tribunals
   - Calendar management for defenses

3. **Presidente del Tribunal** (Tribunal President)
   - Create and manage tribunals
   - Schedule defense dates
   - Coordinate member availability
   - Generate defense acts

4. **Admin** (Administrator)
   - Complete user management (CRUD)
   - Role assignment and permissions
   - System reports and statistics
   - Data export (PDF, Excel)

### Key Architectural Patterns

1. **Context-Based State Management**
   - `AuthContext`: Complete authentication system with role checking
   - `NotificacionesContext`: Centralized notification system

2. **Protected Routes**: Multi-level route protection
   - Authentication-based access control
   - Role-specific route restrictions
   - Automatic redirects based on user role

3. **Layout Component**: Dynamic UI adaptation
   - Role-based navigation menus
   - Integrated notification system
   - Responsive design patterns

4. **Custom Hooks**: Modular business logic
   - `useCalendario.js`: Calendar and defense scheduling
   - `useTFGs.js`: TFG CRUD operations and state management
   - `useTribunales.js`: Tribunal management
   - `useUsuarios.js`: User management for admin functions
   - `useReportes.js`: Report generation and statistics

### Component Organization

```
src/
├── components/
│   ├── Layout.jsx              # Main layout with dynamic navigation
│   ├── ProtectedRoute.jsx      # Route protection component
│   ├── NotificacionesDropdown.jsx # Notification system UI
│   ├── calendario/             # Calendar-specific components
│   └── dashboards/             # Role-specific dashboard components
├── pages/
│   ├── auth/                   # Authentication pages
│   ├── dashboard/              # Main dashboard
│   ├── estudiante/             # Student pages (5 pages)
│   ├── profesor/               # Professor pages (5 pages)
│   └── admin/                  # Admin pages (2 pages)
├── context/                    # React context providers
├── hooks/                      # Custom business logic hooks
└── services/                   # API communication layer (ready for backend)
```

### TFG State Management System

The application implements a comprehensive TFG lifecycle:

```
Borrador → En Revisión → Aprobado → Defendido
```

Each state has specific permissions and available actions based on user role.

### Authentication System

**Current**: Mock authentication with localStorage persistence
**Test Users**:
- `estudiante@uni.es / 123456` (Student role)
- `profesor@uni.es / 123456` (Professor role)
- `admin@uni.es / 123456` (Admin role)

**Future**: Ready for Symfony JWT integration with role-based permissions.

### Key Features Implemented

#### Phase 1-2: Foundation
- Complete routing system with role-based access
- Authentication context with persistent sessions
- Protected route implementation

#### Phase 3: Student Module
- TFG upload with metadata (title, abstract, keywords)
- File upload with progress tracking
- TFG status tracking and notifications
- Defense schedule viewing

#### Phase 4: Professor Module
- Assigned TFG management
- Feedback and evaluation system
- Tribunal participation
- Calendar integration

#### Phase 5: Defense System
- FullCalendar integration for scheduling
- Defense coordination
- Tribunal management
- Availability tracking

#### Phase 6: Administrative System
- Complete user CRUD operations
- Role management and permissions
- Advanced reporting system
- Data export capabilities (PDF, Excel)

### Development Guidelines

#### Code Style
- Spanish interface and comments (consistent with academic context)
- Emoji icons for visual clarity in navigation
- Tailwind CSS utility classes for styling
- React hooks pattern for state management

#### File Naming Conventions
- Components: PascalCase (e.g., `MisTFGs.jsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useTFGs.js`)
- Pages: Descriptive names in Spanish (e.g., `GestionUsuarios.jsx`)

#### Best Practices
- Always run `npm run lint` after making changes
- Use React Hook Form for complex forms
- Implement proper loading states
- Follow role-based access patterns
- Maintain Spanish language consistency

### Testing Strategy
- No testing framework currently configured
- Planned for Phase 8: Jest + React Testing Library + Cypress

### Deployment Readiness
- Vite build system configured for production
- ESLint rules enforced
- Ready for Symfony backend integration
- Prepared for CI/CD pipeline implementation

### Next Phases (Remaining)

#### Phase 7: Symfony Backend (Weeks 7-9)
- Database design and implementation
- JWT authentication system
- REST API development
- File upload handling
- Email notification system

#### Phase 8: Final Polish (Weeks 9-10)
- Comprehensive testing suite
- Performance optimization
- Production deployment
- Documentation completion

### Important Notes for Development

1. **Backend Integration**: All API calls are prepared with Axios service layer
2. **Role Security**: Always check user roles before rendering components or allowing actions
3. **Spanish Localization**: Maintain Spanish language in UI and comments
4. **State Management**: Use provided custom hooks for consistent data handling
5. **Responsive Design**: All components are built with mobile-first approach
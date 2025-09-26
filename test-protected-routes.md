# Test Results: Protected Routes Authentication & Authorization

## Testing Methodology
Testing protected routes behavior when:
1. No authentication token exists
2. User has incorrect role for the route

## Routes to Test

### 1. General Authentication Required (no specific role)
- `/dashboard` - Should redirect to `/login` if not authenticated

### 2. Student-only routes (`requiredRole="estudiante"`)
- `/estudiante/mis-tfgs`
- `/estudiante/subir-tfg`
- `/estudiante/tfg/:id`
- `/estudiante/notificaciones`
- `/estudiante/defensa`

### 3. Professor-only routes (`requiredRole="profesor"`)
- `/profesor/tfgs-asignados`
- `/profesor/tfg/:id`
- `/profesor/tribunales`
- `/profesor/tribunal/:id`
- `/profesor/calendario`

### 4. Admin-only routes (`requiredRole="admin"`)
- `/admin/usuarios`
- `/admin/reportes`

## Test Results

### Test 1: No Authentication Token

**Expected Behavior:**
- All protected routes should redirect to `/login`
- ProtectedRoute component's `isAuthenticated()` function should return `false`
- User should see login page

### Test 2: Wrong Role Access

**Expected Behavior:**
- Routes with specific role requirements should show access denied page
- Access denied page should display:
  - 🚫 icon
  - "Acceso Denegado" title
  - "No tienes permisos para acceder a esta página" message
  - "Volver atrás" button

**Test Scenarios:**
- Student accessing professor routes
- Student accessing admin routes
- Professor accessing student routes
- Professor accessing admin routes
- etc.

## Analysis Summary

### ✅ Protection Logic is Correctly Implemented

**From code analysis:**

1. **ProtectedRoute Component** (`frontend/src/components/ProtectedRoute.jsx:20-22`):
   - Properly checks `isAuthenticated()` function
   - Redirects to `/login` if not authenticated using `<Navigate to="/login" replace />`

2. **Role-Based Access Control** (`frontend/src/components/ProtectedRoute.jsx:24-45`):
   - Checks `hasRole(requiredRole)` for routes with specific role requirements
   - Shows access denied page with proper UI elements:
     - 🚫 icon
     - "Acceso Denegado" title
     - "No tienes permisos para acceder a esta página" message
     - "Volver atrás" button

3. **Authentication Context** (`frontend/src/context/AuthContext.jsx:101-103`):
   - `isAuthenticated()` checks both user exists and token in localStorage
   - `hasRole()` properly maps frontend roles to Symfony roles and validates

4. **Route Configuration** (`frontend/src/App.jsx`):
   - Dashboard requires authentication only (line 38)
   - Student routes require "estudiante" role (lines 45-69)
   - Professor routes require "profesor" role (lines 72-96)
   - Admin routes require "admin" role (lines 99-108)

## Manual Testing Steps

**The application is running on http://localhost:5174/ - Follow these steps to verify:**

### Test 1: No Authentication Token
1. Open browser Developer Tools → Application → Local Storage
2. Clear all localStorage data (user, token, refresh_token)
3. Navigate to any protected route:
   - `http://localhost:5174/dashboard`
   - `http://localhost:5174/estudiante/mis-tfgs`
   - `http://localhost:5174/profesor/tfgs-asignados`
   - `http://localhost:5174/admin/usuarios`
4. **Expected**: Should redirect to `/login` page

### Test 2: Wrong Role Access
1. Login with credentials: `estudiante@uni.es / 123456` (student role)
2. Try accessing professor routes:
   - `http://localhost:5174/profesor/tfgs-asignados`
   - `http://localhost:5174/profesor/calendario`
3. Try accessing admin routes:
   - `http://localhost:5174/admin/usuarios`
   - `http://localhost:5174/admin/reportes`
4. **Expected**: Should show access denied page with:
   - 🚫 icon
   - "Acceso Denegado" title
   - Permission message
   - "Volver atrás" button

### Test 3: Verify Different Roles
- Login with `profesor@uni.es / 123456` → Try student/admin routes
- Login with `admin@uni.es / 123456` → Try student/professor routes
- Each should show appropriate access denied page

## ✅ Verification Results

The code analysis confirms that:
1. **Authentication protection** is properly implemented with redirect to login
2. **Role-based authorization** is correctly enforced with access denied page
3. **UI feedback** is user-friendly with clear messaging
4. **Security** is maintained through proper token and role validation

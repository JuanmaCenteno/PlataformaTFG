# 6. Implementación

## 6.1. Arquitectura de componentes React

La implementación del frontend se estructura siguiendo principios de Clean Architecture adaptados a React, con una separación clara entre lógica de presentación, estado global y comunicación con APIs.

### 6.1.1. Estructura de directorios

```
src/
├── components/           # Componentes reutilizables
│   ├── Layout.jsx       # Layout principal con navegación
│   ├── ProtectedRoute.jsx # Control de acceso por roles
│   ├── NotificacionesDropdown.jsx # Sistema notificaciones
│   ├── ui/              # Componentes base del design system
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Modal.jsx
│   │   └── LoadingSpinner.jsx
│   ├── forms/           # Componentes de formularios
│   │   ├── TFGForm.jsx
│   │   ├── UserForm.jsx
│   │   └── TribunalForm.jsx
│   └── calendario/      # Componentes específicos de calendario
├── pages/               # Páginas organizadas por rol
│   ├── auth/
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   ├── dashboard/
│   │   └── Dashboard.jsx
│   ├── estudiante/
│   │   ├── MisTFGs.jsx
│   │   ├── NuevoTFG.jsx
│   │   ├── EditarTFG.jsx
│   │   ├── SeguimientoTFG.jsx
│   │   └── DefensaProgramada.jsx
│   ├── profesor/
│   │   ├── TFGsAsignados.jsx
│   │   ├── RevisarTFG.jsx
│   │   ├── CalificarTFG.jsx
│   │   ├── MisTribunales.jsx
│   │   └── CalendarioDefensas.jsx
│   └── admin/
│       ├── GestionUsuarios.jsx
│       └── Reportes.jsx
├── context/             # Gestión de estado global
│   ├── AuthContext.jsx
│   └── NotificacionesContext.jsx
├── hooks/               # Custom hooks con lógica de negocio
│   ├── useAuth.js
│   ├── useTFGs.js
│   ├── useUsuarios.js
│   ├── useTribunales.js
│   ├── useCalendario.js
│   └── useReportes.js
├── services/            # Comunicación con APIs
│   ├── api.js
│   ├── authService.js
│   ├── tfgService.js
│   ├── userService.js
│   └── tribunalService.js
└── utils/               # Utilidades y helpers
    ├── constants.js
    ├── validators.js
    └── formatters.js
```

### 6.1.2. Implementación del sistema de autenticación

#### 6.1.2.1. AuthContext y Provider

```javascript
// src/context/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token
      };
    
    case 'LOGIN_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
        user: null,
        token: null
      };
    
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Inicialización desde localStorage
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user, token }
        });
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
      }
    }
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = await authService.login(credentials);
      
      localStorage.setItem('access_token', response.token);
      localStorage.setItem('user_data', JSON.stringify(response.user));
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.token
        }
      });
      
      return response;
    } catch (error) {
      dispatch({
        type: 'LOGIN_ERROR',
        payload: error.message
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

#### 6.1.2.2. Componente ProtectedRoute

```javascript
// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  requireRoles = [],
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Verificar roles requeridos
  if (requireRoles.length > 0) {
    const userRoles = user?.roles || [];
    const hasRequiredRole = requireRoles.some(role => 
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return (
        <Navigate 
          to="/unauthorized" 
          state={{ requiredRoles: requireRoles }} 
          replace 
        />
      );
    }
  }

  return children;
};

export default ProtectedRoute;
```

### 6.1.3. Implementación de Hooks Personalizados

#### 6.1.3.1. useTFGs Hook

```javascript
// src/hooks/useTFGs.js
import { useState, useEffect, useCallback } from 'react';
import { tfgService } from '../services/tfgService';
import { useNotifications } from '../context/NotificacionesContext';

export const useTFGs = () => {
  const [tfgs, setTFGs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addNotification } = useNotifications();

  const fetchTFGs = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await tfgService.getMisTFGs(filters);
      setTFGs(data);
    } catch (error) {
      setError(error.message);
      addNotification({
        type: 'error',
        titulo: 'Error al cargar TFGs',
        mensaje: error.message
      });
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const createTFG = useCallback(async (tfgData) => {
    setLoading(true);
    
    try {
      const newTFG = await tfgService.createTFG(tfgData);
      setTFGs(prev => [newTFG, ...prev]);
      
      addNotification({
        type: 'success',
        titulo: 'TFG creado exitosamente',
        mensaje: `El TFG "${newTFG.titulo}" ha sido creado`
      });
      
      return newTFG;
    } catch (error) {
      addNotification({
        type: 'error',
        titulo: 'Error al crear TFG',
        mensaje: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const updateTFG = useCallback(async (id, tfgData) => {
    setLoading(true);
    
    try {
      const updatedTFG = await tfgService.updateTFG(id, tfgData);
      setTFGs(prev => prev.map(tfg => 
        tfg.id === id ? updatedTFG : tfg
      ));
      
      addNotification({
        type: 'success',
        titulo: 'TFG actualizado',
        mensaje: 'Los cambios han sido guardados exitosamente'
      });
      
      return updatedTFG;
    } catch (error) {
      addNotification({
        type: 'error',
        titulo: 'Error al actualizar TFG',
        mensaje: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const uploadFile = useCallback(async (tfgId, file, onProgress) => {
    try {
      const result = await tfgService.uploadFile(tfgId, file, onProgress);
      
      // Actualizar el TFG en el estado local
      setTFGs(prev => prev.map(tfg => 
        tfg.id === tfgId 
          ? { ...tfg, archivo: result.archivo }
          : tfg
      ));
      
      addNotification({
        type: 'success',
        titulo: 'Archivo subido exitosamente',
        mensaje: `El archivo ${file.name} ha sido subido correctamente`
      });
      
      return result;
    } catch (error) {
      addNotification({
        type: 'error',
        titulo: 'Error al subir archivo',
        mensaje: error.message
      });
      throw error;
    }
  }, [addNotification]);

  const changeState = useCallback(async (tfgId, newState, comment = '') => {
    try {
      const updatedTFG = await tfgService.changeState(tfgId, newState, comment);
      
      setTFGs(prev => prev.map(tfg => 
        tfg.id === tfgId ? updatedTFG : tfg
      ));
      
      addNotification({
        type: 'success',
        titulo: 'Estado actualizado',
        mensaje: `El TFG ha cambiado a estado "${newState}"`
      });
      
      return updatedTFG;
    } catch (error) {
      addNotification({
        type: 'error',
        titulo: 'Error al cambiar estado',
        mensaje: error.message
      });
      throw error;
    }
  }, [addNotification]);

  return {
    tfgs,
    loading,
    error,
    fetchTFGs,
    createTFG,
    updateTFG,
    uploadFile,
    changeState
  };
};
```

### 6.1.4. Componentes de interfaz principales

#### 6.1.4.1. Componente Dashboard

```javascript
// src/pages/dashboard/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTFGs } from '../../hooks/useTFGs';
import { useNotifications } from '../../context/NotificacionesContext';

const Dashboard = () => {
  const { user } = useAuth();
  const { tfgs, fetchTFGs } = useTFGs();
  const { notifications } = useNotifications();
  
  const [stats, setStats] = useState({
    total: 0,
    enRevision: 0,
    aprobados: 0,
    defendidos: 0
  });

  useEffect(() => {
    if (user) {
      fetchTFGs();
    }
  }, [user, fetchTFGs]);

  useEffect(() => {
    if (tfgs.length > 0) {
      const newStats = tfgs.reduce((acc, tfg) => {
        acc.total++;
        switch (tfg.estado) {
          case 'revision':
            acc.enRevision++;
            break;
          case 'aprobado':
            acc.aprobados++;
            break;
          case 'defendido':
            acc.defendidos++;
            break;
        }
        return acc;
      }, { total: 0, enRevision: 0, aprobados: 0, defendidos: 0 });
      
      setStats(newStats);
    }
  }, [tfgs]);

  const getDashboardContent = () => {
    switch (user?.roles[0]) {
      case 'ROLE_ESTUDIANTE':
        return <EstudianteDashboard stats={stats} tfgs={tfgs} />;
      case 'ROLE_PROFESOR':
        return <ProfesorDashboard stats={stats} tfgs={tfgs} />;
      case 'ROLE_PRESIDENTE_TRIBUNAL':
        return <PresidenteDashboard stats={stats} />;
      case 'ROLE_ADMIN':
        return <AdminDashboard stats={stats} />;
      default:
        return <div>Rol no reconocido</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user?.nombre} {user?.apellidos}
        </h1>
        <p className="text-gray-600 mt-1">
          {getRoleDescription(user?.roles[0])}
        </p>
      </div>

      {/* Notificaciones recientes */}
      {notifications.filter(n => !n.leida).length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800">
            Notificaciones pendientes ({notifications.filter(n => !n.leida).length})
          </h3>
          <div className="mt-2 space-y-1">
            {notifications.filter(n => !n.leida).slice(0, 3).map(notification => (
              <p key={notification.id} className="text-sm text-blue-700">
                • {notification.titulo}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Dashboard específico por rol */}
      {getDashboardContent()}
    </div>
  );
};

const getRoleDescription = (role) => {
  const descriptions = {
    'ROLE_ESTUDIANTE': 'Gestiona tu Trabajo de Fin de Grado',
    'ROLE_PROFESOR': 'Supervisa y evalúa TFGs asignados',
    'ROLE_PRESIDENTE_TRIBUNAL': 'Coordina tribunales y defensas',
    'ROLE_ADMIN': 'Administra el sistema y usuarios'
  };
  return descriptions[role] || 'Usuario del sistema';
};

export default Dashboard;
```

## 6.2. Sistema de autenticación y roles

### 6.2.1. Implementación backend con Symfony Security

#### 6.2.1.1. Configuración de seguridad

```yaml
# config/packages/security.yaml
security:
    password_hashers:
        App\Entity\User:
            algorithm: auto

    providers:
        app_user_provider:
            entity:
                class: App\Entity\User
                property: email

    firewalls:
        dev:
            pattern: ^/(_(profiler|wdt)|css|images|js)/
            security: false
            
        api:
            pattern: ^/api
            stateless: true
            jwt: ~
            
        main:
            lazy: true
            provider: app_user_provider

    access_control:
        - { path: ^/api/auth, roles: PUBLIC_ACCESS }
        - { path: ^/api/users, roles: ROLE_ADMIN }
        - { path: ^/api/tfgs/mis-tfgs, roles: ROLE_USER }
        - { path: ^/api/tfgs, roles: [ROLE_ESTUDIANTE, ROLE_ADMIN] }
        - { path: ^/api/tribunales, roles: [ROLE_PRESIDENTE_TRIBUNAL, ROLE_ADMIN] }
        - { path: ^/api, roles: IS_AUTHENTICATED_FULLY }

    role_hierarchy:
        ROLE_ADMIN: [ROLE_PRESIDENTE_TRIBUNAL, ROLE_PROFESOR, ROLE_ESTUDIANTE, ROLE_USER]
        ROLE_PRESIDENTE_TRIBUNAL: [ROLE_PROFESOR, ROLE_USER]
        ROLE_PROFESOR: [ROLE_ESTUDIANTE, ROLE_USER]
        ROLE_ESTUDIANTE: [ROLE_USER]
```

#### 6.2.1.2. Controllador Authenticatción JWT

```php
<?php
// src/Controller/AuthController.php
namespace App\Controller;

use App\Entity\User;
use App\Service\AuthService;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtManager,
        private AuthService $authService,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    #[Route('/login', name: 'api_login', methods: ['POST'])]
    public function login(#[CurrentUser] ?User $user): JsonResponse
    {
        if (!$user) {
            return $this->json([
                'message' => 'Credenciales inválidas'
            ], Response::HTTP_UNAUTHORIZED);
        }

        $token = $this->jwtManager->create($user);
        $refreshToken = $this->authService->createRefreshToken($user);

        return $this->json([
            'token' => $token,
            'refresh_token' => $refreshToken,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'nombre' => $user->getNombre(),
                'apellidos' => $user->getApellidos(),
                'roles' => $user->getRoles()
            ]
        ]);
    }

    #[Route('/refresh', name: 'api_refresh', methods: ['POST'])]
    public function refresh(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $refreshToken = $data['refresh_token'] ?? null;

        if (!$refreshToken) {
            return $this->json([
                'message' => 'Refresh token requerido'
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $newToken = $this->authService->refreshToken($refreshToken);
            
            return $this->json([
                'token' => $newToken
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Token inválido o expirado'
            ], Response::HTTP_UNAUTHORIZED);
        }
    }

    #[Route('/me', name: 'api_me', methods: ['GET'])]
    public function me(#[CurrentUser] User $user): JsonResponse
    {
        return $this->json($user, Response::HTTP_OK, [], [
            'groups' => ['user:read']
        ]);
    }

    #[Route('/logout', name: 'api_logout', methods: ['POST'])]
    public function logout(Request $request): JsonResponse
    {
        $token = $request->headers->get('Authorization');
        
        if ($token && str_starts_with($token, 'Bearer ')) {
            $token = substr($token, 7);
            $this->authService->blacklistToken($token);
        }

        return $this->json([
            'message' => 'Logout exitoso'
        ]);
    }
}
```

### 6.2.2. Voters para control granular de permisos

```php
<?php
// src/Security/TFGVoter.php
namespace App\Security;

use App\Entity\TFG;
use App\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

class TFGVoter extends Voter
{
    public const EDIT = 'TFG_EDIT';
    public const VIEW = 'TFG_VIEW';
    public const DELETE = 'TFG_DELETE';
    public const CHANGE_STATE = 'TFG_CHANGE_STATE';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::EDIT, self::VIEW, self::DELETE, self::CHANGE_STATE])
            && $subject instanceof TFG;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        /** @var TFG $tfg */
        $tfg = $subject;

        return match($attribute) {
            self::VIEW => $this->canView($tfg, $user),
            self::EDIT => $this->canEdit($tfg, $user),
            self::DELETE => $this->canDelete($tfg, $user),
            self::CHANGE_STATE => $this->canChangeState($tfg, $user),
            default => false,
        };
    }

    private function canView(TFG $tfg, User $user): bool
    {
        // Admin puede ver todos
        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            return true;
        }

        // El estudiante puede ver su propio TFG
        if ($tfg->getEstudiante() === $user) {
            return true;
        }

        // El tutor puede ver TFGs asignados
        if ($tfg->getTutor() === $user || $tfg->getCotutor() === $user) {
            return true;
        }

        // Miembros del tribunal pueden ver TFGs para defensas programadas
        if (in_array('ROLE_PROFESOR', $user->getRoles())) {
            $defensa = $tfg->getDefensa();
            if ($defensa && $this->isUserInTribunal($user, $defensa->getTribunal())) {
                return true;
            }
        }

        return false;
    }

    private function canEdit(TFG $tfg, User $user): bool
    {
        // Admin puede editar todos
        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            return true;
        }

        // El estudiante solo puede editar su TFG en estado borrador
        if ($tfg->getEstudiante() === $user && $tfg->getEstado() === 'borrador') {
            return true;
        }

        return false;
    }

    private function canChangeState(TFG $tfg, User $user): bool
    {
        // Admin puede cambiar cualquier estado
        if (in_array('ROLE_ADMIN', $user->getRoles())) {
            return true;
        }

        // El tutor puede cambiar estado de TFGs asignados
        if (($tfg->getTutor() === $user || $tfg->getCotutor() === $user) 
            && in_array('ROLE_PROFESOR', $user->getRoles())) {
            return true;
        }

        return false;
    }

    private function isUserInTribunal(User $user, $tribunal): bool
    {
        if (!$tribunal) {
            return false;
        }

        return $tribunal->getPresidente() === $user ||
               $tribunal->getSecretario() === $user ||
               $tribunal->getVocal() === $user;
    }
}
```

## 6.3. Gestión de estado con Context API

### 6.3.1. NotificacionesContext

```javascript
// src/context/NotificacionesContext.jsx
import React, { createContext, useContext, useReducer, useCallback } from 'react';

const NotificacionesContext = createContext();

const notificacionesReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          {
            id: Date.now() + Math.random(),
            createdAt: new Date(),
            leida: false,
            ...action.payload
          },
          ...state.notifications
        ]
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      };

    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, leida: true }
            : notification
        )
      };

    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          leida: true
        }))
      };

    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };

    default:
      return state;
  }
};

export const NotificacionesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificacionesReducer, {
    notifications: []
  });

  const addNotification = useCallback((notification) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: notification
    });

    // Auto-remove success/info notifications after 5 seconds
    if (['success', 'info'].includes(notification.type)) {
      setTimeout(() => {
        removeNotification(notification.id);
      }, 5000);
    }
  }, []);

  const removeNotification = useCallback((id) => {
    dispatch({
      type: 'REMOVE_NOTIFICATION',
      payload: id
    });
  }, []);

  const markAsRead = useCallback((id) => {
    dispatch({
      type: 'MARK_AS_READ',
      payload: id
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  }, []);

  const clearNotifications = useCallback(() => {
    dispatch({ type: 'CLEAR_NOTIFICATIONS' });
  }, []);

  const value = {
    notifications: state.notifications,
    unreadCount: state.notifications.filter(n => !n.leida).length,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications
  };

  return (
    <NotificacionesContext.Provider value={value}>
      {children}
    </NotificacionesContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificacionesContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificacionesProvider');
  }
  return context;
};
```

## 6.4. APIs REST y endpoints

### 6.4.1. TFG Controller con API Platform

```php
<?php
// src/Controller/TFGController.php
namespace App\Controller;

use App\Entity\TFG;
use App\Service\TFGService;
use App\Service\FileUploadService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/tfgs')]
class TFGController extends AbstractController
{
    public function __construct(
        private TFGService $tfgService,
        private FileUploadService $fileUploadService
    ) {}

    #[Route('/mis-tfgs', name: 'api_tfgs_mis_tfgs', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function misTFGs(#[CurrentUser] User $user): JsonResponse
    {
        $tfgs = $this->tfgService->getTFGsByUser($user);

        return $this->json($tfgs, Response::HTTP_OK, [], [
            'groups' => ['tfg:read', 'user:read']
        ]);
    }

    #[Route('', name: 'api_tfgs_create', methods: ['POST'])]
    #[IsGranted('ROLE_ESTUDIANTE')]
    public function create(
        Request $request, 
        #[CurrentUser] User $user
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        try {
            $tfg = $this->tfgService->createTFG($data, $user);

            return $this->json($tfg, Response::HTTP_CREATED, [], [
                'groups' => ['tfg:read']
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error al crear TFG',
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/{id}', name: 'api_tfgs_update', methods: ['PUT'])]
    public function update(
        TFG $tfg,
        Request $request,
        #[CurrentUser] User $user
    ): JsonResponse {
        $this->denyAccessUnlessGranted('TFG_EDIT', $tfg);

        $data = json_decode($request->getContent(), true);

        try {
            $updatedTFG = $this->tfgService->updateTFG($tfg, $data);

            return $this->json($updatedTFG, Response::HTTP_OK, [], [
                'groups' => ['tfg:read']
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error al actualizar TFG',
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/{id}/upload', name: 'api_tfgs_upload', methods: ['POST'])]
    public function uploadFile(
        TFG $tfg,
        Request $request
    ): JsonResponse {
        $this->denyAccessUnlessGranted('TFG_EDIT', $tfg);

        $file = $request->files->get('archivo');
        
        if (!$file) {
            return $this->json([
                'error' => 'No se ha proporcionado ningún archivo'
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $result = $this->fileUploadService->uploadTFGFile($tfg, $file);

            return $this->json([
                'message' => 'Archivo subido exitosamente',
                'archivo' => $result
            ], Response::HTTP_OK);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error al subir archivo',
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/{id}/estado', name: 'api_tfgs_change_state', methods: ['PUT'])]
    public function changeState(
        TFG $tfg,
        Request $request
    ): JsonResponse {
        $this->denyAccessUnlessGranted('TFG_CHANGE_STATE', $tfg);

        $data = json_decode($request->getContent(), true);
        $newState = $data['estado'] ?? null;
        $comment = $data['comentario'] ?? '';

        if (!$newState) {
            return $this->json([
                'error' => 'Estado requerido'
            ], Response::HTTP_BAD_REQUEST);
        }

        try {
            $updatedTFG = $this->tfgService->changeState($tfg, $newState, $comment);

            return $this->json($updatedTFG, Response::HTTP_OK, [], [
                'groups' => ['tfg:read']
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'error' => 'Error al cambiar estado',
                'message' => $e->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    #[Route('/{id}/download', name: 'api_tfgs_download', methods: ['GET'])]
    public function downloadFile(TFG $tfg): Response
    {
        $this->denyAccessUnlessGranted('TFG_VIEW', $tfg);

        if (!$tfg->getArchivoPath()) {
            return $this->json([
                'error' => 'No hay archivo disponible para este TFG'
            ], Response::HTTP_NOT_FOUND);
        }

        return $this->fileUploadService->createDownloadResponse($tfg);
    }
}
```

### 6.4.2. Capa de Servicios - TFGService

```php
<?php
// src/Service/TFGService.php
namespace App\Service;

use App\Entity\TFG;
use App\Entity\User;
use App\Entity\Comentario;
use App\Repository\TFGRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\EventDispatcher\EventDispatcherInterface;
use App\Event\TFGStateChangedEvent;
use App\Event\TFGCreatedEvent;

class TFGService
{
    private const VALID_STATES = ['borrador', 'revision', 'aprobado', 'defendido'];
    
    private const STATE_TRANSITIONS = [
        'borrador' => ['revision'],
        'revision' => ['borrador', 'aprobado'], 
        'aprobado' => ['defendido'],
        'defendido' => []
    ];

    public function __construct(
        private EntityManagerInterface $entityManager,
        private TFGRepository $tfgRepository,
        private UserRepository $userRepository,
        private EventDispatcherInterface $eventDispatcher,
        private NotificationService $notificationService
    ) {}

    public function createTFG(array $data, User $estudiante): TFG
    {
        // Validar que el estudiante no tenga ya un TFG activo
        $existingTFG = $this->tfgRepository->findActiveByStudent($estudiante);
        if ($existingTFG) {
            throw new \RuntimeException('Ya tienes un TFG activo');
        }

        // Validar datos requeridos
        $this->validateTFGData($data);

        // Obtener tutor
        $tutor = $this->userRepository->find($data['tutor_id']);
        if (!$tutor || !in_array('ROLE_PROFESOR', $tutor->getRoles())) {
            throw new \RuntimeException('Tutor inválido');
        }

        // Crear TFG
        $tfg = new TFG();
        $tfg->setTitulo($data['titulo']);
        $tfg->setDescripcion($data['descripcion'] ?? '');
        $tfg->setResumen($data['resumen'] ?? '');
        $tfg->setPalabrasClave($data['palabras_clave'] ?? []);
        $tfg->setEstudiante($estudiante);
        $tfg->setTutor($tutor);
        $tfg->setEstado('borrador');
        $tfg->setFechaInicio(new \DateTime());

        // Cotutor opcional
        if (!empty($data['cotutor_id'])) {
            $cotutor = $this->userRepository->find($data['cotutor_id']);
            if ($cotutor && in_array('ROLE_PROFESOR', $cotutor->getRoles())) {
                $tfg->setCotutor($cotutor);
            }
        }

        $this->entityManager->persist($tfg);
        $this->entityManager->flush();

        // Dispatch events
        $this->eventDispatcher->dispatch(
            new TFGCreatedEvent($tfg),
            TFGCreatedEvent::NAME
        );

        return $tfg;
    }

    public function updateTFG(TFG $tfg, array $data): TFG
    {
        // Solo se puede editar en estado borrador
        if ($tfg->getEstado() !== 'borrador') {
            throw new \RuntimeException('Solo se puede editar TFG en estado borrador');
        }

        $this->validateTFGData($data);

        $tfg->setTitulo($data['titulo']);
        $tfg->setDescripcion($data['descripcion'] ?? $tfg->getDescripcion());
        $tfg->setResumen($data['resumen'] ?? $tfg->getResumen());
        $tfg->setPalabrasClave($data['palabras_clave'] ?? $tfg->getPalabrasClave());
        $tfg->setUpdatedAt(new \DateTime());

        $this->entityManager->flush();

        return $tfg;
    }

    public function changeState(TFG $tfg, string $newState, string $comment = ''): TFG
    {
        if (!in_array($newState, self::VALID_STATES)) {
            throw new \RuntimeException("Estado inválido: {$newState}");
        }

        $currentState = $tfg->getEstado();
        $allowedTransitions = self::STATE_TRANSITIONS[$currentState] ?? [];

        if (!in_array($newState, $allowedTransitions)) {
            throw new \RuntimeException(
                "No se puede cambiar de '{$currentState}' a '{$newState}'"
            );
        }

        $previousState = $tfg->getEstado();
        $tfg->setEstado($newState);
        $tfg->setUpdatedAt(new \DateTime());

        // Agregar comentario si se proporciona
        if (!empty($comment)) {
            $comentario = new Comentario();
            $comentario->setTfg($tfg);
            $comentario->setAutor($tfg->getTutor()); // Asumimos que el tutor cambia el estado
            $comentario->setComentario($comment);
            $comentario->setTipo('revision');
            
            $this->entityManager->persist($comentario);
        }

        $this->entityManager->flush();

        // Dispatch event
        $this->eventDispatcher->dispatch(
            new TFGStateChangedEvent($tfg, $previousState, $newState),
            TFGStateChangedEvent::NAME
        );

        return $tfg;
    }

    public function getTFGsByUser(User $user): array
    {
        $roles = $user->getRoles();

        if (in_array('ROLE_ADMIN', $roles)) {
            return $this->tfgRepository->findAll();
        } elseif (in_array('ROLE_PROFESOR', $roles)) {
            return $this->tfgRepository->findByTutor($user);
        } else {
            return $this->tfgRepository->findByStudent($user);
        }
    }

    private function validateTFGData(array $data): void
    {
        if (empty($data['titulo'])) {
            throw new \RuntimeException('El título es requerido');
        }

        if (strlen($data['titulo']) < 10) {
            throw new \RuntimeException('El título debe tener al menos 10 caracteres');
        }

        if (empty($data['tutor_id'])) {
            throw new \RuntimeException('El tutor es requerido');
        }
    }
}
```

## 6.5. Sistema de archivos y uploads

### 6.5.1. FileUploadService

```php
<?php
// src/Service/FileUploadService.php
namespace App\Service;

use App\Entity\TFG;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Vich\UploaderBundle\Handler\UploadHandler;
use Doctrine\ORM\EntityManagerInterface;

class FileUploadService
{
    private const MAX_FILE_SIZE = 52428800; // 50MB
    private const ALLOWED_MIME_TYPES = ['application/pdf'];
    private const UPLOAD_PATH = 'uploads/tfgs';

    public function __construct(
        private EntityManagerInterface $entityManager,
        private UploadHandler $uploadHandler,
        private string $projectDir
    ) {}

    public function uploadTFGFile(TFG $tfg, UploadedFile $file): array
    {
        $this->validateFile($file);
        
        // Eliminar archivo anterior si existe
        if ($tfg->getArchivoPath()) {
            $this->removeOldFile($tfg->getArchivoPath());
        }

        // Generar nombre único
        $fileName = $this->generateUniqueFileName($file);
        $uploadPath = $this->projectDir . '/public/' . self::UPLOAD_PATH;
        
        // Crear directorio si no existe
        if (!is_dir($uploadPath)) {
            mkdir($uploadPath, 0755, true);
        }

        // Mover archivo
        $file->move($uploadPath, $fileName);
        $relativePath = self::UPLOAD_PATH . '/' . $fileName;

        // Actualizar entidad TFG
        $tfg->setArchivoPath($relativePath);
        $tfg->setArchivoOriginalName($file->getClientOriginalName());
        $tfg->setArchivoSize($file->getSize());
        $tfg->setArchivoMimeType($file->getMimeType());
        $tfg->setUpdatedAt(new \DateTime());

        $this->entityManager->flush();

        return [
            'path' => $relativePath,
            'original_name' => $file->getClientOriginalName(),
            'size' => $file->getSize(),
            'mime_type' => $file->getMimeType()
        ];
    }

    public function createDownloadResponse(TFG $tfg): BinaryFileResponse
    {
        $filePath = $this->projectDir . '/public/' . $tfg->getArchivoPath();
        
        if (!file_exists($filePath)) {
            throw new \RuntimeException('Archivo no encontrado');
        }

        $response = new BinaryFileResponse($filePath);
        
        // Configurar headers para descarga
        $response->setContentDisposition(
            ResponseHeaderBag::DISPOSITION_ATTACHMENT,
            $tfg->getArchivoOriginalName() ?? 'tfg.pdf'
        );

        $response->headers->set('Content-Type', 'application/pdf');
        $response->headers->set('Content-Length', filesize($filePath));

        return $response;
    }

    private function validateFile(UploadedFile $file): void
    {
        // Validar tamaño
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new \RuntimeException(
                'El archivo es demasiado grande. Tamaño máximo: ' . 
                (self::MAX_FILE_SIZE / 1024 / 1024) . 'MB'
            );
        }

        // Validar tipo MIME
        if (!in_array($file->getMimeType(), self::ALLOWED_MIME_TYPES)) {
            throw new \RuntimeException(
                'Tipo de archivo no permitido. Solo se permiten archivos PDF'
            );
        }

        // Validar extensión
        $extension = strtolower($file->getClientOriginalExtension());
        if ($extension !== 'pdf') {
            throw new \RuntimeException('Solo se permiten archivos PDF');
        }

        // Validar que el archivo no esté corrupto
        if ($file->getError() !== UPLOAD_ERR_OK) {
            throw new \RuntimeException('Error al subir el archivo');
        }
    }

    private function generateUniqueFileName(UploadedFile $file): string
    {
        $extension = $file->guessExtension() ?: 'pdf';
        return uniqid() . '_' . time() . '.' . $extension;
    }

    private function removeOldFile(string $filePath): void
    {
        $fullPath = $this->projectDir . '/public/' . $filePath;
        if (file_exists($fullPath)) {
            unlink($fullPath);
        }
    }
}
```

## 6.6. Sistema de notificaciones

### 6.6.1. NotificationService

```php
<?php
// src/Service/NotificationService.php
namespace App\Service;

use App\Entity\Notificacion;
use App\Entity\User;
use App\Entity\TFG;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Twig\Environment;

class NotificationService
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private MailerInterface $mailer,
        private Environment $twig,
        private string $fromEmail = 'noreply@tfg-platform.com'
    ) {}

    public function notifyTutorOfNewTFG(TFG $tfg): void
    {
        $this->createNotification(
            user: $tfg->getTutor(),
            tipo: 'info',
            titulo: 'Nuevo TFG asignado',
            mensaje: "Se te ha asignado un nuevo TFG: \"{$tfg->getTitulo()}\"",
            metadata: ['tfg_id' => $tfg->getId()]
        );

        $this->sendEmail(
            to: $tfg->getTutor()->getEmail(),
            subject: 'Nuevo TFG asignado - Plataforma TFG',
            template: 'emails/nuevo_tfg_asignado.html.twig',
            context: [
                'tutor' => $tfg->getTutor(),
                'tfg' => $tfg,
                'estudiante' => $tfg->getEstudiante()
            ]
        );
    }

    public function notifyStudentStateChange(TFG $tfg, string $previousState, string $newState): void
    {
        $messages = [
            'revision' => 'Tu TFG ha sido enviado para revisión',
            'aprobado' => '¡Felicidades! Tu TFG ha sido aprobado para defensa',
            'defendido' => 'Tu TFG ha sido marcado como defendido'
        ];

        $message = $messages[$newState] ?? "El estado de tu TFG ha cambiado a: {$newState}";

        $this->createNotification(
            user: $tfg->getEstudiante(),
            tipo: $newState === 'aprobado' ? 'success' : 'info',
            titulo: 'Estado de TFG actualizado',
            mensaje: $message,
            metadata: [
                'tfg_id' => $tfg->getId(),
                'previous_state' => $previousState,
                'new_state' => $newState
            ]
        );

        if ($newState === 'aprobado') {
            $this->sendEmail(
                to: $tfg->getEstudiante()->getEmail(),
                subject: 'TFG Aprobado - Listo para Defensa',
                template: 'emails/tfg_aprobado.html.twig',
                context: [
                    'estudiante' => $tfg->getEstudiante(),
                    'tfg' => $tfg
                ]
            );
        }
    }

    public function notifyDefenseScheduled(TFG $tfg): void
    {
        $defensa = $tfg->getDefensa();
        
        if (!$defensa) {
            return;
        }

        // Notificar al estudiante
        $this->createNotification(
            user: $tfg->getEstudiante(),
            tipo: 'info',
            titulo: 'Defensa programada',
            mensaje: "Tu defensa ha sido programada para el {$defensa->getFechaDefensa()->format('d/m/Y H:i')}",
            metadata: [
                'tfg_id' => $tfg->getId(),
                'defensa_id' => $defensa->getId()
            ]
        );

        // Notificar a los miembros del tribunal
        $tribunal = $defensa->getTribunal();
        $miembros = [$tribunal->getPresidente(), $tribunal->getSecretario(), $tribunal->getVocal()];

        foreach ($miembros as $miembro) {
            $this->createNotification(
                user: $miembro,
                tipo: 'info',
                titulo: 'Defensa asignada',
                mensaje: "Se te ha asignado una defensa para el {$defensa->getFechaDefensa()->format('d/m/Y H:i')}",
                metadata: [
                    'tfg_id' => $tfg->getId(),
                    'defensa_id' => $defensa->getId()
                ]
            );
        }

        // Enviar emails
        $this->sendEmail(
            to: $tfg->getEstudiante()->getEmail(),
            subject: 'Defensa Programada - Plataforma TFG',
            template: 'emails/defensa_programada.html.twig',
            context: [
                'estudiante' => $tfg->getEstudiante(),
                'tfg' => $tfg,
                'defensa' => $defensa
            ]
        );
    }

    private function createNotification(
        User $user,
        string $tipo,
        string $titulo,
        string $mensaje,
        array $metadata = []
    ): Notificacion {
        $notification = new Notificacion();
        $notification->setUsuario($user);
        $notification->setTipo($tipo);
        $notification->setTitulo($titulo);
        $notification->setMensaje($mensaje);
        $notification->setMetadata($metadata);
        $notification->setLeida(false);
        $notification->setEnviadaPorEmail(false);

        $this->entityManager->persist($notification);
        $this->entityManager->flush();

        return $notification;
    }

    private function sendEmail(
        string $to,
        string $subject,
        string $template,
        array $context
    ): void {
        try {
            $htmlContent = $this->twig->render($template, $context);

            $email = (new Email())
                ->from($this->fromEmail)
                ->to($to)
                ->subject($subject)
                ->html($htmlContent);

            $this->mailer->send($email);
        } catch (\Exception $e) {
            // Log error but don't fail the operation
            error_log("Error sending email: " . $e->getMessage());
        }
    }

    public function getUnreadNotifications(User $user): array
    {
        return $this->entityManager
            ->getRepository(Notificacion::class)
            ->findBy(
                ['usuario' => $user, 'leida' => false],
                ['createdAt' => 'DESC']
            );
    }

    public function markAsRead(Notificacion $notification): void
    {
        $notification->setLeida(true);
        $this->entityManager->flush();
    }
}
```

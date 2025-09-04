#!/usr/bin/env python3
"""
Tests para endpoints de gestión de Usuarios (Solo Admin)
Base URL: https://tfg-backend.ddev.site
"""
import requests
import json
import sys
import os
import random
import string
import urllib3

# Deshabilitar warnings SSL para entorno de desarrollo DDEV
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://tfg-backend.ddev.site"

class UsersTestSuite:
    def __init__(self, tokens=None):
        self.session = requests.Session()
        # Deshabilitar verificación SSL para DDEV local
        self.session.verify = False
        self.tokens = tokens or {}
        self.test_results = []
        self.created_users = []  # Para cleanup
        
        # Headers para cada rol
        self.headers = {}
        if self.tokens.get('estudiante'):
            self.headers['estudiante'] = {'Authorization': f'Bearer {self.tokens["estudiante"]}'}
        if self.tokens.get('profesor'):
            self.headers['profesor'] = {'Authorization': f'Bearer {self.tokens["profesor"]}'}
        if self.tokens.get('admin'):
            self.headers['admin'] = {'Authorization': f'Bearer {self.tokens["admin"]}'}
        
    def log_test(self, test_name, status, details=None):
        """Registra el resultado de un test"""
        result = {
            "test": test_name,
            "status": status,
            "details": details or ""
        }
        self.test_results.append(result)
        print(f"[{'PASS' if status else 'FAIL'}] {test_name}")
        if details and not status:
            print(f"    Details: {details}")
    
    def generate_random_email(self):
        """Genera un email aleatorio para tests"""
        random_string = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        return f"test_{random_string}@uni.es"
    
    def test_get_users_admin(self):
        """Test GET /api/users como admin"""
        if 'admin' not in self.headers:
            self.log_test("GET users admin", False, "No hay token de admin")
            return False
            
        try:
            response = self.session.get(
                f"{BASE_URL}/api/users",
                headers=self.headers['admin']
            )
            
            if response.status_code == 200:
                data = response.json()
                users_count = len(data.get('data', data if isinstance(data, list) else []))
                total = data.get('meta', {}).get('total', users_count)
                self.log_test("GET users admin", True, f"Obtenidos {users_count} usuarios (total: {total})")
                return True
            else:
                self.log_test("GET users admin", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET users admin", False, f"Exception: {str(e)}")
            return False
    
    def test_get_users_with_pagination_admin(self):
        """Test GET /api/users con paginación como admin"""
        if 'admin' not in self.headers:
            self.log_test("GET users paginación admin", False, "No hay token de admin")
            return False
            
        try:
            params = {
                "page": 1,
                "per_page": 5
            }
            
            response = self.session.get(
                f"{BASE_URL}/api/users",
                params=params,
                headers=self.headers['admin']
            )
            
            if response.status_code == 200:
                data = response.json()
                users_count = len(data.get('data', []))
                page = data.get('meta', {}).get('page', 1)
                per_page = data.get('meta', {}).get('per_page', users_count)
                self.log_test("GET users paginación admin", True, f"Página {page}: {users_count} usuarios (máx {per_page})")
                return True
            else:
                self.log_test("GET users paginación admin", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET users paginación admin", False, f"Exception: {str(e)}")
            return False
    
    def test_get_users_filter_role_admin(self):
        """Test GET /api/users con filtro por rol como admin"""
        if 'admin' not in self.headers:
            self.log_test("GET users filtro rol admin", False, "No hay token de admin")
            return False
            
        try:
            params = {
                "role": "ROLE_ESTUDIANTE"
            }
            
            response = self.session.get(
                f"{BASE_URL}/api/users",
                params=params,
                headers=self.headers['admin']
            )
            
            if response.status_code == 200:
                data = response.json()
                users_count = len(data.get('data', data if isinstance(data, list) else []))
                self.log_test("GET users filtro rol admin", True, f"Obtenidos {users_count} estudiantes")
                return True
            else:
                self.log_test("GET users filtro rol admin", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET users filtro rol admin", False, f"Exception: {str(e)}")
            return False
    
    def test_get_users_profesor_forbidden(self):
        """Test GET /api/users como profesor (debería fallar)"""
        if 'profesor' not in self.headers:
            self.log_test("GET users profesor (forbidden)", False, "No hay token de profesor")
            return False
            
        try:
            response = self.session.get(
                f"{BASE_URL}/api/users",
                headers=self.headers['profesor']
            )
            
            if response.status_code in [401, 403]:
                self.log_test("GET users profesor (forbidden)", True, f"Acceso denegado correctamente: {response.status_code}")
                return True
            else:
                self.log_test("GET users profesor (forbidden)", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("GET users profesor (forbidden)", False, f"Exception: {str(e)}")
            return False
    
    def test_get_users_estudiante_forbidden(self):
        """Test GET /api/users como estudiante (debería fallar)"""
        if 'estudiante' not in self.headers:
            self.log_test("GET users estudiante (forbidden)", False, "No hay token de estudiante")
            return False
            
        try:
            response = self.session.get(
                f"{BASE_URL}/api/users",
                headers=self.headers['estudiante']
            )
            
            if response.status_code in [401, 403]:
                self.log_test("GET users estudiante (forbidden)", True, f"Acceso denegado correctamente: {response.status_code}")
                return True
            else:
                self.log_test("GET users estudiante (forbidden)", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("GET users estudiante (forbidden)", False, f"Exception: {str(e)}")
            return False
    
    def test_create_user_estudiante_admin(self):
        """Test POST /api/users para crear estudiante como admin"""
        if 'admin' not in self.headers:
            self.log_test("POST user estudiante admin", False, "No hay token de admin")
            return False
            
        try:
            email = self.generate_random_email()
            payload = {
                "email": email,
                "password": "password123",
                "nombre": "Test",
                "apellidos": "Estudiante Prueba",
                "roles": ["ROLE_ESTUDIANTE"],
                "dni": f"{random.randint(10000000, 99999999)}X",
                "telefono": f"6{random.randint(10000000, 99999999)}"
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/users",
                json=payload,
                headers=self.headers['admin']
            )
            
            if response.status_code == 201:
                data = response.json()
                if 'id' in data:
                    self.created_users.append(data['id'])
                    self.log_test("POST user estudiante admin", True, f"Estudiante creado con ID: {data['id']}")
                    return data['id']
                else:
                    self.log_test("POST user estudiante admin", False, "Respuesta no contiene ID")
                    return False
            else:
                self.log_test("POST user estudiante admin", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("POST user estudiante admin", False, f"Exception: {str(e)}")
            return False
    
    def test_create_user_profesor_admin(self):
        """Test POST /api/users para crear profesor como admin"""
        if 'admin' not in self.headers:
            self.log_test("POST user profesor admin", False, "No hay token de admin")
            return False
            
        try:
            email = self.generate_random_email()
            payload = {
                "email": email,
                "password": "password123",
                "nombre": "Test",
                "apellidos": "Profesor Prueba",
                "roles": ["ROLE_PROFESOR"],
                "dni": f"{random.randint(10000000, 99999999)}Y",
                "telefono": f"6{random.randint(10000000, 99999999)}",
                "universidad": "Universidad de Test",
                "departamento": "Departamento de Informática",
                "especialidad": "Ingeniería del Software"
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/users",
                json=payload,
                headers=self.headers['admin']
            )
            
            if response.status_code == 201:
                data = response.json()
                if 'id' in data:
                    self.created_users.append(data['id'])
                    self.log_test("POST user profesor admin", True, f"Profesor creado con ID: {data['id']}")
                    return data['id']
                else:
                    self.log_test("POST user profesor admin", False, "Respuesta no contiene ID")
                    return False
            else:
                self.log_test("POST user profesor admin", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("POST user profesor admin", False, f"Exception: {str(e)}")
            return False
    
    def test_create_user_admin_admin(self):
        """Test POST /api/users para crear admin como admin"""
        if 'admin' not in self.headers:
            self.log_test("POST user admin admin", False, "No hay token de admin")
            return False
            
        try:
            email = self.generate_random_email()
            payload = {
                "email": email,
                "password": "password123",
                "nombre": "Test",
                "apellidos": "Admin Prueba",
                "roles": ["ROLE_ADMIN"],
                "dni": f"{random.randint(10000000, 99999999)}Z",
                "telefono": f"6{random.randint(10000000, 99999999)}"
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/users",
                json=payload,
                headers=self.headers['admin']
            )
            
            if response.status_code == 201:
                data = response.json()
                if 'id' in data:
                    self.created_users.append(data['id'])
                    self.log_test("POST user admin admin", True, f"Admin creado con ID: {data['id']}")
                    return data['id']
                else:
                    self.log_test("POST user admin admin", False, "Respuesta no contiene ID")
                    return False
            else:
                self.log_test("POST user admin admin", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("POST user admin admin", False, f"Exception: {str(e)}")
            return False
    
    def test_create_user_profesor_forbidden(self):
        """Test POST /api/users como profesor (debería fallar)"""
        if 'profesor' not in self.headers:
            self.log_test("POST user profesor (forbidden)", False, "No hay token de profesor")
            return False
            
        try:
            payload = {
                "email": "forbidden@uni.es",
                "password": "password123",
                "nombre": "Forbidden",
                "apellidos": "User",
                "roles": ["ROLE_ESTUDIANTE"]
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/users",
                json=payload,
                headers=self.headers['profesor']
            )
            
            if response.status_code in [401, 403]:
                self.log_test("POST user profesor (forbidden)", True, f"Acceso denegado correctamente: {response.status_code}")
                return True
            else:
                self.log_test("POST user profesor (forbidden)", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("POST user profesor (forbidden)", False, f"Exception: {str(e)}")
            return False
    
    def test_create_user_estudiante_forbidden(self):
        """Test POST /api/users como estudiante (debería fallar)"""
        if 'estudiante' not in self.headers:
            self.log_test("POST user estudiante (forbidden)", False, "No hay token de estudiante")
            return False
            
        try:
            payload = {
                "email": "forbidden2@uni.es",
                "password": "password123",
                "nombre": "Forbidden",
                "apellidos": "User2",
                "roles": ["ROLE_ESTUDIANTE"]
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/users",
                json=payload,
                headers=self.headers['estudiante']
            )
            
            if response.status_code in [401, 403]:
                self.log_test("POST user estudiante (forbidden)", True, f"Acceso denegado correctamente: {response.status_code}")
                return True
            else:
                self.log_test("POST user estudiante (forbidden)", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("POST user estudiante (forbidden)", False, f"Exception: {str(e)}")
            return False
    
    def test_create_user_invalid_email(self):
        """Test POST /api/users con email inválido"""
        if 'admin' not in self.headers:
            self.log_test("POST user email inválido", False, "No hay token de admin")
            return False
            
        try:
            payload = {
                "email": "email-invalido",  # Email sin formato válido
                "password": "password123",
                "nombre": "Test",
                "apellidos": "Invalid Email",
                "roles": ["ROLE_ESTUDIANTE"]
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/users",
                json=payload,
                headers=self.headers['admin']
            )
            
            if response.status_code in [400, 422]:
                self.log_test("POST user email inválido", True, f"Validación correcta: {response.status_code}")
                return True
            else:
                self.log_test("POST user email inválido", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("POST user email inválido", False, f"Exception: {str(e)}")
            return False
    
    def test_create_user_missing_fields(self):
        """Test POST /api/users con campos requeridos faltantes"""
        if 'admin' not in self.headers:
            self.log_test("POST user campos faltantes", False, "No hay token de admin")
            return False
            
        try:
            payload = {
                "email": "incomplete@uni.es"
                # Faltan password, nombre, apellidos, roles
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/users",
                json=payload,
                headers=self.headers['admin']
            )
            
            if response.status_code in [400, 422]:
                self.log_test("POST user campos faltantes", True, f"Validación correcta: {response.status_code}")
                return True
            else:
                self.log_test("POST user campos faltantes", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("POST user campos faltantes", False, f"Exception: {str(e)}")
            return False
    
    def test_create_user_duplicate_email(self):
        """Test POST /api/users con email duplicado"""
        if 'admin' not in self.headers:
            self.log_test("POST user email duplicado", False, "No hay token de admin")
            return False
            
        try:
            # Usar email que sabemos que existe (admin)
            payload = {
                "email": "admin@uni.es",  # Este email ya existe
                "password": "password123",
                "nombre": "Duplicate",
                "apellidos": "Email Test",
                "roles": ["ROLE_ESTUDIANTE"]
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/users",
                json=payload,
                headers=self.headers['admin']
            )
            
            if response.status_code in [400, 409, 422]:
                self.log_test("POST user email duplicado", True, f"Duplicado rechazado correctamente: {response.status_code}")
                return True
            else:
                self.log_test("POST user email duplicado", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("POST user email duplicado", False, f"Exception: {str(e)}")
            return False
    
    def cleanup_created_users(self):
        """Elimina los usuarios creados durante las pruebas"""
        if not self.created_users:
            return
            
        print(f"\n=== LIMPIEZA: Eliminando {len(self.created_users)} usuarios creados ===")
        
        for user_id in self.created_users:
            try:
                # Intentar eliminar como admin si tenemos token
                if 'admin' in self.headers:
                    response = self.session.delete(
                        f"{BASE_URL}/api/users/{user_id}",
                        headers=self.headers['admin']
                    )
                    if response.status_code in [200, 204]:
                        print(f"✓ Usuario {user_id} eliminado")
                    else:
                        print(f"✗ No se pudo eliminar usuario {user_id}: {response.status_code}")
                else:
                    print(f"⚠ No se puede eliminar usuario {user_id}: no hay token de admin")
                    
            except Exception as e:
                print(f"✗ Error eliminando usuario {user_id}: {str(e)}")
    
    def run_all_tests(self):
        """Ejecuta todos los tests de usuarios"""
        print("=== TESTS DE USUARIOS ===")
        
        # Tests de lectura
        self.test_get_users_admin()
        self.test_get_users_with_pagination_admin()
        self.test_get_users_filter_role_admin()
        
        # Tests de permisos de lectura
        self.test_get_users_profesor_forbidden()
        self.test_get_users_estudiante_forbidden()
        
        # Tests de creación
        self.test_create_user_estudiante_admin()
        self.test_create_user_profesor_admin()
        self.test_create_user_admin_admin()
        
        # Tests de permisos de creación
        self.test_create_user_profesor_forbidden()
        self.test_create_user_estudiante_forbidden()
        
        # Tests de validación
        self.test_create_user_invalid_email()
        self.test_create_user_missing_fields()
        self.test_create_user_duplicate_email()
        
        # Resumen
        passed = sum(1 for r in self.test_results if r['status'])
        total = len(self.test_results)
        
        print(f"\n=== RESUMEN USUARIOS ===")
        print(f"Pasados: {passed}/{total}")
        
        return self.test_results

if __name__ == "__main__":
    # Cargar tokens de autenticación
    try:
        with open('/tmp/tfg_test_tokens.json', 'r') as f:
            tokens = json.load(f)
    except:
        tokens = {}
    
    users_suite = UsersTestSuite(tokens)
    results = users_suite.run_all_tests()
    
    # Cleanup
    users_suite.cleanup_created_users()
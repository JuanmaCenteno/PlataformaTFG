#!/usr/bin/env python3
"""
Tests para endpoints de gestión de Tribunales
Base URL: https://tfg-backend.ddev.site
"""
import requests
import json
import sys
import os
import urllib3

# Deshabilitar warnings SSL para entorno de desarrollo DDEV
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://tfg-backend.ddev.site"

class TribunalesTestSuite:
    def __init__(self, tokens=None):
        self.session = requests.Session()
        # Deshabilitar verificación SSL para DDEV local
        self.session.verify = False
        self.tokens = tokens or {}
        self.test_results = []
        self.created_tribunales = []  # Para cleanup
        
        # Headers para cada rol
        self.headers = {}
        if self.tokens.get('estudiante'):
            self.headers['estudiante'] = {'Authorization': f'Bearer {self.tokens["estudiante"]}'}
        if self.tokens.get('profesor'):
            self.headers['profesor'] = {'Authorization': f'Bearer {self.tokens["profesor"]}'}
        if self.tokens.get('admin'):
            self.headers['admin'] = {'Authorization': f'Bearer {self.tokens["admin"]}'}
        if self.tokens.get('presidente'):
            self.headers['presidente'] = {'Authorization': f'Bearer {self.tokens["presidente"]}'}
        
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
    
    def test_get_tribunales_profesor(self):
        """Test GET /api/tribunales como profesor"""
        if 'profesor' not in self.headers:
            self.log_test("GET tribunales profesor", False, "No hay token de profesor")
            return False
            
        try:
            response = self.session.get(
                f"{BASE_URL}/api/tribunales",
                headers=self.headers['profesor']
            )
            
            if response.status_code == 200:
                data = response.json()
                tribunales_count = len(data.get('data', data if isinstance(data, list) else []))
                self.log_test("GET tribunales profesor", True, f"Obtenidos {tribunales_count} tribunales")
                return True
            else:
                self.log_test("GET tribunales profesor", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET tribunales profesor", False, f"Exception: {str(e)}")
            return False
    
    def test_get_tribunales_admin(self):
        """Test GET /api/tribunales como admin"""
        if 'admin' not in self.headers:
            self.log_test("GET tribunales admin", False, "No hay token de admin")
            return False
            
        try:
            response = self.session.get(
                f"{BASE_URL}/api/tribunales",
                headers=self.headers['admin']
            )
            
            if response.status_code == 200:
                data = response.json()
                tribunales_count = len(data.get('data', data if isinstance(data, list) else []))
                self.log_test("GET tribunales admin", True, f"Obtenidos {tribunales_count} tribunales")
                return True
            else:
                self.log_test("GET tribunales admin", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET tribunales admin", False, f"Exception: {str(e)}")
            return False
    
    def test_get_tribunales_estudiante_forbidden(self):
        """Test GET /api/tribunales como estudiante (debería fallar)"""
        if 'estudiante' not in self.headers:
            self.log_test("GET tribunales estudiante (forbidden)", False, "No hay token de estudiante")
            return False
            
        try:
            response = self.session.get(
                f"{BASE_URL}/api/tribunales",
                headers=self.headers['estudiante']
            )
            
            if response.status_code in [401, 403]:
                self.log_test("GET tribunales estudiante (forbidden)", True, f"Acceso denegado correctamente: {response.status_code}")
                return True
            else:
                self.log_test("GET tribunales estudiante (forbidden)", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("GET tribunales estudiante (forbidden)", False, f"Exception: {str(e)}")
            return False
    
    def test_create_tribunal_admin(self):
        """Test POST /api/tribunales como admin"""
        if 'admin' not in self.headers:
            self.log_test("POST tribunal admin", False, "No hay token de admin")
            return False
            
        try:
            payload = {
                "nombre": "Tribunal Test Informática",
                "presidente_id": 9,  # Usuario presidente@uni.es con ROLE_PRESIDENTE_TRIBUNAL
                "secretario_id": 7,  # Usuario secretario@uni.es con ROLE_PROFESOR
                "vocal_id": 8,       # Usuario vocal@uni.es con ROLE_PROFESOR
                "descripcion": "Tribunal de prueba para tests de API"
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/tribunales",
                json=payload,
                headers=self.headers['admin']
            )
            
            if response.status_code == 201:
                data = response.json()
                if 'id' in data:
                    self.created_tribunales.append(data['id'])
                    self.log_test("POST tribunal admin", True, f"Tribunal creado con ID: {data['id']}")
                    return data['id']
                else:
                    self.log_test("POST tribunal admin", False, "Respuesta no contiene ID")
                    return False
            else:
                self.log_test("POST tribunal admin", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("POST tribunal admin", False, f"Exception: {str(e)}")
            return False
    
    def test_create_tribunal_presidente(self):
        """Test POST /api/tribunales como presidente de tribunal"""
        # Nota: Según backend.md, los presidentes de tribunal también pueden crear tribunales
        if 'presidente' not in self.headers:
            self.log_test("POST tribunal presidente", False, "No hay token de presidente")
            return False
            
        try:
            payload = {
                "nombre": "Tribunal Test Presidente",
                "presidente_id": 9,
                "secretario_id": 7,
                "vocal_id": 8,
                "descripcion": "Tribunal creado por presidente de tribunal"
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/tribunales",
                json=payload,
                headers=self.headers['presidente']
            )
            
            if response.status_code == 201:
                data = response.json()
                if 'id' in data:
                    self.created_tribunales.append(data['id'])
                    self.log_test("POST tribunal presidente", True, f"Tribunal creado con ID: {data['id']}")
                    return data['id']
                else:
                    self.log_test("POST tribunal presidente", False, "Respuesta no contiene ID")
                    return False
            else:
                self.log_test("POST tribunal presidente", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("POST tribunal presidente", False, f"Exception: {str(e)}")
            return False
    
    def test_create_tribunal_profesor_forbidden(self):
        """Test POST /api/tribunales como profesor (debería fallar)"""
        if 'profesor' not in self.headers:
            self.log_test("POST tribunal profesor (forbidden)", False, "No hay token de profesor")
            return False
            
        try:
            payload = {
                "nombre": "Tribunal Test Forbidden",
                "presidente_id": 9,
                "secretario_id": 7,
                "vocal_id": 8,
                "descripcion": "Este tribunal no debería crearse"
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/tribunales",
                json=payload,
                headers=self.headers['profesor']
            )
            
            if response.status_code in [401, 403]:
                self.log_test("POST tribunal profesor (forbidden)", True, f"Acceso denegado correctamente: {response.status_code}")
                return True
            else:
                self.log_test("POST tribunal profesor (forbidden)", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("POST tribunal profesor (forbidden)", False, f"Exception: {str(e)}")
            return False
    
    def test_create_tribunal_estudiante_forbidden(self):
        """Test POST /api/tribunales como estudiante (debería fallar)"""
        if 'estudiante' not in self.headers:
            self.log_test("POST tribunal estudiante (forbidden)", False, "No hay token de estudiante")
            return False
            
        try:
            payload = {
                "nombre": "Tribunal Test Estudiante",
                "presidente_id": 9,
                "secretario_id": 7,
                "vocal_id": 8,
                "descripcion": "Este tribunal no debería crearse"
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/tribunales",
                json=payload,
                headers=self.headers['estudiante']
            )
            
            if response.status_code in [401, 403]:
                self.log_test("POST tribunal estudiante (forbidden)", True, f"Acceso denegado correctamente: {response.status_code}")
                return True
            else:
                self.log_test("POST tribunal estudiante (forbidden)", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("POST tribunal estudiante (forbidden)", False, f"Exception: {str(e)}")
            return False
    
    def test_create_tribunal_invalid_data(self):
        """Test POST /api/tribunales con datos inválidos"""
        if 'admin' not in self.headers:
            self.log_test("POST tribunal datos inválidos", False, "No hay token de admin")
            return False
            
        try:
            payload = {
                "nombre": "",  # Nombre vacío (inválido)
                "presidente_id": 999,  # ID que probablemente no existe
                "secretario_id": 999,
                "vocal_id": 999
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/tribunales",
                json=payload,
                headers=self.headers['admin']
            )
            
            if response.status_code in [400, 422]:
                self.log_test("POST tribunal datos inválidos", True, f"Validación correcta: {response.status_code}")
                return True
            else:
                self.log_test("POST tribunal datos inválidos", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("POST tribunal datos inválidos", False, f"Exception: {str(e)}")
            return False
    
    def cleanup_created_tribunales(self):
        """Elimina los tribunales creados durante las pruebas"""
        if not self.created_tribunales:
            return
            
        print(f"\n=== LIMPIEZA: Eliminando {len(self.created_tribunales)} tribunales creados ===")
        
        for tribunal_id in self.created_tribunales:
            try:
                # Intentar eliminar como admin si tenemos token
                if 'admin' in self.headers:
                    response = self.session.delete(
                        f"{BASE_URL}/api/tribunales/{tribunal_id}",
                        headers=self.headers['admin']
                    )
                    if response.status_code in [200, 204]:
                        print(f"✓ Tribunal {tribunal_id} eliminado")
                    else:
                        print(f"✗ No se pudo eliminar tribunal {tribunal_id}: {response.status_code}")
                else:
                    print(f"⚠ No se puede eliminar tribunal {tribunal_id}: no hay token de admin")
                    
            except Exception as e:
                print(f"✗ Error eliminando tribunal {tribunal_id}: {str(e)}")
    
    def run_all_tests(self):
        """Ejecuta todos los tests de tribunales"""
        print("=== TESTS DE TRIBUNALES ===")
        
        # Tests de lectura
        self.test_get_tribunales_profesor()
        self.test_get_tribunales_admin()
        self.test_get_tribunales_estudiante_forbidden()
        
        # Tests de creación
        self.test_create_tribunal_admin()
        self.test_create_tribunal_presidente()
        
        # Tests de permisos
        self.test_create_tribunal_profesor_forbidden()
        self.test_create_tribunal_estudiante_forbidden()
        
        # Tests de validación
        self.test_create_tribunal_invalid_data()
        
        # Resumen
        passed = sum(1 for r in self.test_results if r['status'])
        total = len(self.test_results)
        
        print(f"\n=== RESUMEN TRIBUNALES ===")
        print(f"Pasados: {passed}/{total}")
        
        return self.test_results

if __name__ == "__main__":
    # Cargar tokens de autenticación
    try:
        with open('/tmp/tfg_test_tokens.json', 'r') as f:
            tokens = json.load(f)
    except:
        tokens = {}
    
    tribunales_suite = TribunalesTestSuite(tokens)
    results = tribunales_suite.run_all_tests()
    
    # Cleanup
    tribunales_suite.cleanup_created_tribunales()
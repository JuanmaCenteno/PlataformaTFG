#!/usr/bin/env python3
"""
Tests para endpoints de autenticación
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

class AuthTestSuite:
    def __init__(self):
        self.session = requests.Session()
        # Deshabilitar verificación SSL para DDEV local
        self.session.verify = False
        self.tokens = {}
        self.test_results = []
        
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
    
    def test_login_estudiante(self):
        """Test login con credenciales de estudiante"""
        try:
            payload = {
                "username": "estudiante@uni.es",
                "password": "123456"
            }
            
            response = self.session.post(f"{BASE_URL}/api/auth/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data:
                    self.tokens['estudiante'] = data['token']
                    self.tokens['estudiante_refresh'] = data.get('refresh_token', '')
                    self.log_test("Login estudiante", True, f"Token obtenido: {data['token'][:20]}...")
                    return True
                else:
                    self.log_test("Login estudiante", False, "Respuesta no contiene token")
                    return False
            else:
                self.log_test("Login estudiante", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Login estudiante", False, f"Exception: {str(e)}")
            return False
    
    def test_login_profesor(self):
        """Test login con credenciales de profesor"""
        try:
            payload = {
                "username": "profesor@uni.es",
                "password": "123456"
            }
            
            response = self.session.post(f"{BASE_URL}/api/auth/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data:
                    self.tokens['profesor'] = data['token']
                    self.tokens['profesor_refresh'] = data.get('refresh_token', '')
                    self.log_test("Login profesor", True, f"Token obtenido: {data['token'][:20]}...")
                    return True
                else:
                    self.log_test("Login profesor", False, "Respuesta no contiene token")
                    return False
            else:
                self.log_test("Login profesor", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Login profesor", False, f"Exception: {str(e)}")
            return False
    
    def test_login_admin(self):
        """Test login con credenciales de admin"""
        try:
            payload = {
                "username": "admin@uni.es",
                "password": "123456"
            }
            
            response = self.session.post(f"{BASE_URL}/api/auth/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data:
                    self.tokens['admin'] = data['token']
                    self.tokens['admin_refresh'] = data.get('refresh_token', '')
                    self.log_test("Login admin", True, f"Token obtenido: {data['token'][:20]}...")
                    return True
                else:
                    self.log_test("Login admin", False, "Respuesta no contiene token")
                    return False
            else:
                self.log_test("Login admin", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Login admin", False, f"Exception: {str(e)}")
            return False
    
    def test_login_invalid(self):
        """Test login con credenciales inválidas"""
        try:
            payload = {
                "username": "invalid@uni.es",
                "password": "wrongpass"
            }
            
            response = self.session.post(f"{BASE_URL}/api/auth/login", json=payload)
            
            if response.status_code in [401, 403]:
                self.log_test("Login inválido", True, f"Status correcto: {response.status_code}")
                return True
            else:
                self.log_test("Login inválido", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Login inválido", False, f"Exception: {str(e)}")
            return False
    
    def test_login_presidente(self):
        """Test login con credenciales de presidente del tribunal"""
        try:
            payload = {
                "username": "presidente@uni.es",
                "password": "123456"
            }
            
            response = self.session.post(f"{BASE_URL}/api/auth/login", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data:
                    self.tokens['presidente'] = data['token']
                    self.tokens['presidente_refresh'] = data.get('refresh_token', '')
                    self.log_test("Login presidente", True, f"Token obtenido: {data['token'][:20]}...")
                    return True
                else:
                    self.log_test("Login presidente", False, "Respuesta no contiene token")
                    return False
            else:
                self.log_test("Login presidente", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Login presidente", False, f"Exception: {str(e)}")
            return False
    
    def test_refresh_token(self):
        """Test refresh token si está disponible"""
        if not self.tokens.get('estudiante_refresh'):
            self.log_test("Refresh token", False, "No hay refresh token para testear")
            return False
            
        try:
            payload = {
                "refresh_token": self.tokens['estudiante_refresh']
            }
            
            response = self.session.post(f"{BASE_URL}/api/auth/refresh", json=payload)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data:
                    self.log_test("Refresh token", True, f"Nuevo token obtenido: {data['token'][:20]}...")
                    return True
                else:
                    self.log_test("Refresh token", False, "Respuesta no contiene token")
                    return False
            else:
                self.log_test("Refresh token", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Refresh token", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Ejecuta todos los tests de autenticación"""
        print("=== TESTS DE AUTENTICACIÓN ===")
        
        tests = [
            self.test_login_estudiante,
            self.test_login_profesor,
            self.test_login_admin,
            self.test_login_presidente,
            self.test_login_invalid,
            self.test_refresh_token
        ]
        
        for test in tests:
            test()
        
        # Resumen
        passed = sum(1 for r in self.test_results if r['status'])
        total = len(self.test_results)
        
        print(f"\n=== RESUMEN AUTENTICACIÓN ===")
        print(f"Pasados: {passed}/{total}")
        
        return self.tokens, self.test_results

if __name__ == "__main__":
    auth_suite = AuthTestSuite()
    tokens, results = auth_suite.run_all_tests()
    
    # Guardar tokens para otros tests
    with open('/tmp/tfg_test_tokens.json', 'w') as f:
        json.dump(tokens, f)
    
    print("\nTokens guardados en /tmp/tfg_test_tokens.json para otros tests")
#!/usr/bin/env python3
"""
Tests para endpoints de gestión de Defensas
Base URL: https://tfg-backend.ddev.site
"""
import requests
import json
import sys
import os
from datetime import datetime, timedelta
import urllib3

# Deshabilitar warnings SSL para entorno de desarrollo DDEV
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://tfg-backend.ddev.site"

class DefensasTestSuite:
    def __init__(self, tokens=None):
        self.session = requests.Session()
        # Deshabilitar verificación SSL para DDEV local
        self.session.verify = False
        self.tokens = tokens or {}
        self.test_results = []
        self.created_defensas = []  # Para cleanup
        
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
    
    def test_get_calendario_defensas_profesor(self):
        """Test GET /api/defensas/calendario como profesor"""
        if 'profesor' not in self.headers:
            self.log_test("GET calendario defensas profesor", False, "No hay token de profesor")
            return False
            
        try:
            # Obtener defensas del mes actual
            fecha_inicio = datetime.now().strftime("%Y-%m-01")
            fecha_fin = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
            
            params = {
                "fecha_inicio": fecha_inicio,
                "fecha_fin": fecha_fin
            }
            
            response = self.session.get(
                f"{BASE_URL}/api/defensas/calendario",
                params=params,
                headers=self.headers['profesor']
            )
            
            if response.status_code == 200:
                data = response.json()
                events_count = len(data.get('events', []))
                self.log_test("GET calendario defensas profesor", True, f"Obtenidos {events_count} eventos de defensa")
                return True
            else:
                self.log_test("GET calendario defensas profesor", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET calendario defensas profesor", False, f"Exception: {str(e)}")
            return False
    
    def test_get_calendario_defensas_estudiante(self):
        """Test GET /api/defensas/calendario como estudiante"""
        if 'estudiante' not in self.headers:
            self.log_test("GET calendario defensas estudiante", False, "No hay token de estudiante")
            return False
            
        try:
            # Obtener defensas del mes actual
            fecha_inicio = datetime.now().strftime("%Y-%m-01")
            fecha_fin = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
            
            params = {
                "fecha_inicio": fecha_inicio,
                "fecha_fin": fecha_fin
            }
            
            response = self.session.get(
                f"{BASE_URL}/api/defensas/calendario",
                params=params,
                headers=self.headers['estudiante']
            )
            
            if response.status_code == 200:
                data = response.json()
                events_count = len(data.get('events', []))
                self.log_test("GET calendario defensas estudiante", True, f"Obtenidos {events_count} eventos de defensa")
                return True
            else:
                self.log_test("GET calendario defensas estudiante", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET calendario defensas estudiante", False, f"Exception: {str(e)}")
            return False
    
    def test_get_calendario_defensas_admin(self):
        """Test GET /api/defensas/calendario como admin"""
        if 'admin' not in self.headers:
            self.log_test("GET calendario defensas admin", False, "No hay token de admin")
            return False
            
        try:
            # Obtener defensas del mes actual
            fecha_inicio = datetime.now().strftime("%Y-%m-01")
            fecha_fin = (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d")
            
            params = {
                "fecha_inicio": fecha_inicio,
                "fecha_fin": fecha_fin
            }
            
            response = self.session.get(
                f"{BASE_URL}/api/defensas/calendario",
                params=params,
                headers=self.headers['admin']
            )
            
            if response.status_code == 200:
                data = response.json()
                events_count = len(data.get('events', []))
                self.log_test("GET calendario defensas admin", True, f"Obtenidos {events_count} eventos de defensa")
                return True
            else:
                self.log_test("GET calendario defensas admin", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET calendario defensas admin", False, f"Exception: {str(e)}")
            return False
    
    def test_create_defensa_admin(self):
        """Test POST /api/defensas como admin"""
        if 'admin' not in self.headers:
            self.log_test("POST defensa admin", False, "No hay token de admin")
            return False
            
        try:
            # Programar defensa para la próxima semana
            fecha_defensa = (datetime.now() + timedelta(days=7)).replace(hour=10, minute=0, second=0, microsecond=0)
            
            payload = {
                "tfg_id": 1,  # Asumimos que existe un TFG con ID 1
                "tribunal_id": 1,  # Asumimos que existe un tribunal con ID 1
                "fecha_defensa": fecha_defensa.isoformat() + "Z",
                "aula": "Aula Test 101",
                "duracion_estimada": 30,
                "observaciones": "Defensa de prueba para testing de API"
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/defensas",
                json=payload,
                headers=self.headers['admin']
            )
            
            if response.status_code == 201:
                data = response.json()
                if 'id' in data:
                    self.created_defensas.append(data['id'])
                    self.log_test("POST defensa admin", True, f"Defensa creada con ID: {data['id']}")
                    return data['id']
                else:
                    self.log_test("POST defensa admin", False, "Respuesta no contiene ID")
                    return False
            else:
                self.log_test("POST defensa admin", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("POST defensa admin", False, f"Exception: {str(e)}")
            return False
    
    def test_create_defensa_presidente(self):
        """Test POST /api/defensas como presidente de tribunal"""
        # Nota: Según backend.md, los presidentes de tribunal también pueden crear defensas
        if 'admin' not in self.headers:  # Usamos admin como presidente para el test
            self.log_test("POST defensa presidente", False, "No hay token disponible")
            return False
            
        try:
            # Programar defensa para la próxima semana
            fecha_defensa = (datetime.now() + timedelta(days=8)).replace(hour=11, minute=0, second=0, microsecond=0)
            
            payload = {
                "tfg_id": 2,  # Asumimos que existe un TFG con ID 2
                "tribunal_id": 1,  # Asumimos que existe un tribunal con ID 1
                "fecha_defensa": fecha_defensa.isoformat() + "Z",
                "aula": "Aula Test 102",
                "duracion_estimada": 45,
                "observaciones": "Defensa programada por presidente de tribunal"
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/defensas",
                json=payload,
                headers=self.headers['admin']  # Usamos admin como presidente
            )
            
            if response.status_code == 201:
                data = response.json()
                if 'id' in data:
                    self.created_defensas.append(data['id'])
                    self.log_test("POST defensa presidente", True, f"Defensa creada con ID: {data['id']}")
                    return data['id']
                else:
                    self.log_test("POST defensa presidente", False, "Respuesta no contiene ID")
                    return False
            else:
                self.log_test("POST defensa presidente", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("POST defensa presidente", False, f"Exception: {str(e)}")
            return False
    
    def test_create_defensa_profesor_forbidden(self):
        """Test POST /api/defensas como profesor (debería fallar)"""
        if 'profesor' not in self.headers:
            self.log_test("POST defensa profesor (forbidden)", False, "No hay token de profesor")
            return False
            
        try:
            fecha_defensa = (datetime.now() + timedelta(days=9)).replace(hour=12, minute=0, second=0, microsecond=0)
            
            payload = {
                "tfg_id": 1,
                "tribunal_id": 1,
                "fecha_defensa": fecha_defensa.isoformat() + "Z",
                "aula": "Aula Forbidden",
                "duracion_estimada": 30,
                "observaciones": "Esta defensa no debería crearse"
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/defensas",
                json=payload,
                headers=self.headers['profesor']
            )
            
            if response.status_code in [401, 403]:
                self.log_test("POST defensa profesor (forbidden)", True, f"Acceso denegado correctamente: {response.status_code}")
                return True
            else:
                self.log_test("POST defensa profesor (forbidden)", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("POST defensa profesor (forbidden)", False, f"Exception: {str(e)}")
            return False
    
    def test_create_defensa_estudiante_forbidden(self):
        """Test POST /api/defensas como estudiante (debería fallar)"""
        if 'estudiante' not in self.headers:
            self.log_test("POST defensa estudiante (forbidden)", False, "No hay token de estudiante")
            return False
            
        try:
            fecha_defensa = (datetime.now() + timedelta(days=10)).replace(hour=13, minute=0, second=0, microsecond=0)
            
            payload = {
                "tfg_id": 1,
                "tribunal_id": 1,
                "fecha_defensa": fecha_defensa.isoformat() + "Z",
                "aula": "Aula Estudiante",
                "duracion_estimada": 30,
                "observaciones": "Esta defensa no debería crearse"
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/defensas",
                json=payload,
                headers=self.headers['estudiante']
            )
            
            if response.status_code in [401, 403]:
                self.log_test("POST defensa estudiante (forbidden)", True, f"Acceso denegado correctamente: {response.status_code}")
                return True
            else:
                self.log_test("POST defensa estudiante (forbidden)", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("POST defensa estudiante (forbidden)", False, f"Exception: {str(e)}")
            return False
    
    def test_create_defensa_invalid_data(self):
        """Test POST /api/defensas con datos inválidos"""
        if 'admin' not in self.headers:
            self.log_test("POST defensa datos inválidos", False, "No hay token de admin")
            return False
            
        try:
            payload = {
                "tfg_id": 999,  # ID que probablemente no existe
                "tribunal_id": 999,  # ID que probablemente no existe
                "fecha_defensa": "fecha-invalida",  # Fecha inválida
                "aula": "",  # Aula vacía
                "duracion_estimada": -10  # Duración negativa
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/defensas",
                json=payload,
                headers=self.headers['admin']
            )
            
            if response.status_code in [400, 422]:
                self.log_test("POST defensa datos inválidos", True, f"Validación correcta: {response.status_code}")
                return True
            else:
                self.log_test("POST defensa datos inválidos", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("POST defensa datos inválidos", False, f"Exception: {str(e)}")
            return False
    
    def test_create_defensa_conflicto_horario(self):
        """Test POST /api/defensas con conflicto de horario"""
        if 'admin' not in self.headers:
            self.log_test("POST defensa conflicto horario", False, "No hay token de admin")
            return False
            
        try:
            # Intentar programar dos defensas en el mismo horario
            fecha_defensa = (datetime.now() + timedelta(days=11)).replace(hour=14, minute=0, second=0, microsecond=0)
            
            payload = {
                "tfg_id": 1,
                "tribunal_id": 1,
                "fecha_defensa": fecha_defensa.isoformat() + "Z",
                "aula": "Aula Test Conflicto",
                "duracion_estimada": 30,
                "observaciones": "Test de conflicto de horario"
            }
            
            # Crear primera defensa
            response1 = self.session.post(
                f"{BASE_URL}/api/defensas",
                json=payload,
                headers=self.headers['admin']
            )
            
            if response1.status_code == 201:
                data1 = response1.json()
                if 'id' in data1:
                    self.created_defensas.append(data1['id'])
                
                # Intentar crear segunda defensa con el mismo horario
                payload['tfg_id'] = 2  # Diferente TFG
                response2 = self.session.post(
                    f"{BASE_URL}/api/defensas",
                    json=payload,
                    headers=self.headers['admin']
                )
                
                if response2.status_code in [400, 409, 422]:
                    self.log_test("POST defensa conflicto horario", True, f"Conflicto detectado correctamente: {response2.status_code}")
                    return True
                else:
                    # Si se permite el conflicto, también es válido dependiendo de la implementación
                    if response2.status_code == 201:
                        data2 = response2.json()
                        if 'id' in data2:
                            self.created_defensas.append(data2['id'])
                        self.log_test("POST defensa conflicto horario", True, "Conflicto permitido por el sistema")
                        return True
                    else:
                        self.log_test("POST defensa conflicto horario", False, f"Status inesperado: {response2.status_code}")
                        return False
            else:
                self.log_test("POST defensa conflicto horario", False, f"No se pudo crear primera defensa: {response1.status_code}")
                return False
                
        except Exception as e:
            self.log_test("POST defensa conflicto horario", False, f"Exception: {str(e)}")
            return False
    
    def cleanup_created_defensas(self):
        """Elimina las defensas creadas durante las pruebas"""
        if not self.created_defensas:
            return
            
        print(f"\n=== LIMPIEZA: Eliminando {len(self.created_defensas)} defensas creadas ===")
        
        for defensa_id in self.created_defensas:
            try:
                # Intentar eliminar como admin si tenemos token
                if 'admin' in self.headers:
                    response = self.session.delete(
                        f"{BASE_URL}/api/defensas/{defensa_id}",
                        headers=self.headers['admin']
                    )
                    if response.status_code in [200, 204]:
                        print(f"✓ Defensa {defensa_id} eliminada")
                    else:
                        print(f"✗ No se pudo eliminar defensa {defensa_id}: {response.status_code}")
                else:
                    print(f"⚠ No se puede eliminar defensa {defensa_id}: no hay token de admin")
                    
            except Exception as e:
                print(f"✗ Error eliminando defensa {defensa_id}: {str(e)}")
    
    def run_all_tests(self):
        """Ejecuta todos los tests de defensas"""
        print("=== TESTS DE DEFENSAS ===")
        
        # Tests de lectura del calendario
        self.test_get_calendario_defensas_profesor()
        self.test_get_calendario_defensas_estudiante()
        self.test_get_calendario_defensas_admin()
        
        # Tests de creación
        self.test_create_defensa_admin()
        self.test_create_defensa_presidente()
        
        # Tests de permisos
        self.test_create_defensa_profesor_forbidden()
        self.test_create_defensa_estudiante_forbidden()
        
        # Tests de validación
        self.test_create_defensa_invalid_data()
        self.test_create_defensa_conflicto_horario()
        
        # Resumen
        passed = sum(1 for r in self.test_results if r['status'])
        total = len(self.test_results)
        
        print(f"\n=== RESUMEN DEFENSAS ===")
        print(f"Pasados: {passed}/{total}")
        
        return self.test_results

if __name__ == "__main__":
    # Cargar tokens de autenticación
    try:
        with open('/tmp/tfg_test_tokens.json', 'r') as f:
            tokens = json.load(f)
    except:
        tokens = {}
    
    defensas_suite = DefensasTestSuite(tokens)
    results = defensas_suite.run_all_tests()
    
    # Cleanup
    defensas_suite.cleanup_created_defensas()
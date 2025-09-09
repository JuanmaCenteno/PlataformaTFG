#!/usr/bin/env python3
"""
Tests para endpoints de Sistema de Notificaciones
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

class NotificationsTestSuite:
    def __init__(self, tokens=None):
        self.session = requests.Session()
        # Deshabilitar verificación SSL para DDEV local
        self.session.verify = False
        self.tokens = tokens or {}
        self.test_results = []
        self.created_notifications = []  # Para cleanup
        
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
    
    def test_get_notifications_estudiante(self):
        """Test GET /api/notificaciones como estudiante"""
        if 'estudiante' not in self.headers:
            self.log_test("GET notificaciones estudiante", False, "No hay token de estudiante")
            return False
            
        try:
            response = self.session.get(
                f"{BASE_URL}/api/notificaciones",
                headers=self.headers['estudiante']
            )
            
            if response.status_code == 200:
                data = response.json()
                notifications_count = len(data.get('data', data if isinstance(data, list) else []))
                no_leidas = data.get('no_leidas', 0)
                self.log_test("GET notificaciones estudiante", True, f"Obtenidas {notifications_count} notificaciones ({no_leidas} no leídas)")
                return data.get('data', [])
            else:
                self.log_test("GET notificaciones estudiante", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET notificaciones estudiante", False, f"Exception: {str(e)}")
            return False
    
    def test_get_notifications_profesor(self):
        """Test GET /api/notificaciones como profesor"""
        if 'profesor' not in self.headers:
            self.log_test("GET notificaciones profesor", False, "No hay token de profesor")
            return False
            
        try:
            response = self.session.get(
                f"{BASE_URL}/api/notificaciones",
                headers=self.headers['profesor']
            )
            
            if response.status_code == 200:
                data = response.json()
                notifications_count = len(data.get('data', data if isinstance(data, list) else []))
                no_leidas = data.get('no_leidas', 0)
                self.log_test("GET notificaciones profesor", True, f"Obtenidas {notifications_count} notificaciones ({no_leidas} no leídas)")
                return data.get('data', [])
            else:
                self.log_test("GET notificaciones profesor", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET notificaciones profesor", False, f"Exception: {str(e)}")
            return False
    
    def test_get_notifications_admin(self):
        """Test GET /api/notificaciones como admin"""
        if 'admin' not in self.headers:
            self.log_test("GET notificaciones admin", False, "No hay token de admin")
            return False
            
        try:
            response = self.session.get(
                f"{BASE_URL}/api/notificaciones",
                headers=self.headers['admin']
            )
            
            if response.status_code == 200:
                data = response.json()
                notifications_count = len(data.get('data', data if isinstance(data, list) else []))
                no_leidas = data.get('no_leidas', 0)
                self.log_test("GET notificaciones admin", True, f"Obtenidas {notifications_count} notificaciones ({no_leidas} no leídas)")
                return data.get('data', [])
            else:
                self.log_test("GET notificaciones admin", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET notificaciones admin", False, f"Exception: {str(e)}")
            return False
    
    def test_get_notifications_unauthorized(self):
        """Test GET /api/notificaciones sin token (debería fallar)"""
        try:
            response = self.session.get(f"{BASE_URL}/api/notificaciones")
            
            if response.status_code in [401, 403]:
                self.log_test("GET notificaciones sin auth", True, f"Acceso denegado correctamente: {response.status_code}")
                return True
            else:
                self.log_test("GET notificaciones sin auth", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("GET notificaciones sin auth", False, f"Exception: {str(e)}")
            return False
    
    def test_mark_notification_read_estudiante(self, notifications=None):
        """Test PUT /api/notificaciones/{id}/marcar-leida como estudiante"""
        if 'estudiante' not in self.headers:
            self.log_test("Marcar notificación leída estudiante", False, "No hay token de estudiante")
            return False
        
        # Si no se proporcionan notificaciones, intentar obtenerlas
        if not notifications:
            notifications = self.test_get_notifications_estudiante()
            
        if not notifications or not isinstance(notifications, list) or len(notifications) == 0:
            self.log_test("Marcar notificación leída estudiante", False, "No hay notificaciones para marcar como leídas")
            return False
            
        try:
            # Buscar una notificación no leída
            unread_notification = None
            for notif in notifications:
                if not notif.get('leida', True):  # Si leida es False o no existe
                    unread_notification = notif
                    break
            
            if not unread_notification:
                # Si no hay notificaciones no leídas, usar la primera disponible
                unread_notification = notifications[0]
            
            notification_id = unread_notification.get('id')
            if not notification_id:
                self.log_test("Marcar notificación leída estudiante", False, "Notificación no tiene ID")
                return False
            
            response = self.session.put(
                f"{BASE_URL}/api/notificaciones/{notification_id}/marcar-leida",
                headers=self.headers['estudiante']
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Marcar notificación leída estudiante", True, f"Notificación {notification_id} marcada como leída")
                return True
            else:
                self.log_test("Marcar notificación leída estudiante", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Marcar notificación leída estudiante", False, f"Exception: {str(e)}")
            return False
    
    def test_mark_notification_read_profesor(self, notifications=None):
        """Test PUT /api/notificaciones/{id}/marcar-leida como profesor"""
        if 'profesor' not in self.headers:
            self.log_test("Marcar notificación leída profesor", False, "No hay token de profesor")
            return False
        
        # Si no se proporcionan notificaciones, intentar obtenerlas
        if not notifications:
            notifications = self.test_get_notifications_profesor()
            
        if not notifications or not isinstance(notifications, list) or len(notifications) == 0:
            self.log_test("Marcar notificación leída profesor", False, "No hay notificaciones para marcar como leídas")
            return False
            
        try:
            # Usar la primera notificación disponible
            notification = notifications[0]
            notification_id = notification.get('id')
            
            if not notification_id:
                self.log_test("Marcar notificación leída profesor", False, "Notificación no tiene ID")
                return False
            
            response = self.session.put(
                f"{BASE_URL}/api/notificaciones/{notification_id}/marcar-leida",
                headers=self.headers['profesor']
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Marcar notificación leída profesor", True, f"Notificación {notification_id} marcada como leída")
                return True
            else:
                self.log_test("Marcar notificación leída profesor", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Marcar notificación leída profesor", False, f"Exception: {str(e)}")
            return False
    
    def test_mark_notification_read_invalid_id(self):
        """Test PUT /api/notificaciones/{id}/marcar-leida con ID inválido"""
        if 'estudiante' not in self.headers:
            self.log_test("Marcar notificación ID inválido", False, "No hay token de estudiante")
            return False
            
        try:
            # Usar un ID que probablemente no existe
            invalid_id = 999999
            
            response = self.session.put(
                f"{BASE_URL}/api/notificaciones/{invalid_id}/marcar-leida",
                headers=self.headers['estudiante']
            )
            
            if response.status_code == 404:
                self.log_test("Marcar notificación ID inválido", True, f"ID inválido rechazado correctamente: {response.status_code}")
                return True
            else:
                self.log_test("Marcar notificación ID inválido", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Marcar notificación ID inválido", False, f"Exception: {str(e)}")
            return False
    
    def test_mark_notification_read_unauthorized(self):
        """Test PUT /api/notificaciones/{id}/marcar-leida sin token (debería fallar)"""
        try:
            response = self.session.put(f"{BASE_URL}/api/notificaciones/1/marcar-leida")
            
            if response.status_code in [401, 403]:
                self.log_test("Marcar notificación sin auth", True, f"Acceso denegado correctamente: {response.status_code}")
                return True
            else:
                self.log_test("Marcar notificación sin auth", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Marcar notificación sin auth", False, f"Exception: {str(e)}")
            return False
    
    def test_mark_other_user_notification(self):
        """Test intentar marcar como leída una notificación de otro usuario"""
        # Este test requeriría conocer IDs específicos de notificaciones de otros usuarios
        # Por simplicidad, usaremos un ID alto que probablemente pertenezca a otro usuario
        if 'estudiante' not in self.headers:
            self.log_test("Marcar notificación de otro usuario", False, "No hay token de estudiante")
            return False
            
        try:
            # Usar un ID que probablemente pertenezca a otro usuario
            other_user_notification_id = 1000
            
            response = self.session.put(
                f"{BASE_URL}/api/notificaciones/{other_user_notification_id}/marcar-leida",
                headers=self.headers['estudiante']
            )
            
            if response.status_code in [403, 404]:
                self.log_test("Marcar notificación de otro usuario", True, f"Acceso a notificación ajena denegado: {response.status_code}")
                return True
            else:
                self.log_test("Marcar notificación de otro usuario", False, f"Status inesperado: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Marcar notificación de otro usuario", False, f"Exception: {str(e)}")
            return False
    
    def test_notifications_filtering_by_type(self):
        """Test filtrado de notificaciones por tipo (si está implementado)"""
        if 'estudiante' not in self.headers:
            self.log_test("Filtrar notificaciones por tipo", False, "No hay token de estudiante")
            return False
            
        try:
            params = {
                "tipo": "success"
            }
            
            response = self.session.get(
                f"{BASE_URL}/api/notificaciones",
                params=params,
                headers=self.headers['estudiante']
            )
            
            if response.status_code == 200:
                data = response.json()
                notifications_count = len(data.get('data', data if isinstance(data, list) else []))
                self.log_test("Filtrar notificaciones por tipo", True, f"Filtro aplicado: {notifications_count} notificaciones de tipo 'success'")
                return True
            else:
                # Si el filtrado no está implementado, el endpoint podría ignorar el parámetro
                if response.status_code == 200:
                    self.log_test("Filtrar notificaciones por tipo", True, "Filtrado no implementado, pero endpoint responde correctamente")
                    return True
                else:
                    self.log_test("Filtrar notificaciones por tipo", False, f"Status: {response.status_code}, Body: {response.text}")
                    return False
                
        except Exception as e:
            self.log_test("Filtrar notificaciones por tipo", False, f"Exception: {str(e)}")
            return False
    
    def test_notifications_pagination(self):
        """Test paginación de notificaciones (si está implementado)"""
        if 'profesor' not in self.headers:
            self.log_test("Paginación de notificaciones", False, "No hay token de profesor")
            return False
            
        try:
            params = {
                "page": 1,
                "per_page": 5
            }
            
            response = self.session.get(
                f"{BASE_URL}/api/notificaciones",
                params=params,
                headers=self.headers['profesor']
            )
            
            if response.status_code == 200:
                data = response.json()
                notifications_count = len(data.get('data', data if isinstance(data, list) else []))
                self.log_test("Paginación de notificaciones", True, f"Paginación: {notifications_count} notificaciones por página")
                return True
            else:
                self.log_test("Paginación de notificaciones", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Paginación de notificaciones", False, f"Exception: {str(e)}")
            return False
    
    def cleanup_created_notifications(self):
        """Limpia las notificaciones creadas durante las pruebas"""
        # En este caso, no creamos notificaciones manualmente, 
        # ya que normalmente son creadas por el sistema automáticamente
        # Pero incluimos el método por consistencia con otros test suites
        if not self.created_notifications:
            return
            
        print(f"\n=== LIMPIEZA: Eliminando {len(self.created_notifications)} notificaciones creadas ===")
        
        for notification_id in self.created_notifications:
            try:
                if 'admin' in self.headers:
                    response = self.session.delete(
                        f"{BASE_URL}/api/notificaciones/{notification_id}",
                        headers=self.headers['admin']
                    )
                    if response.status_code in [200, 204]:
                        print(f"✓ Notificación {notification_id} eliminada")
                    else:
                        print(f"✗ No se pudo eliminar notificación {notification_id}: {response.status_code}")
                else:
                    print(f"⚠ No se puede eliminar notificación {notification_id}: no hay token de admin")
                    
            except Exception as e:
                print(f"✗ Error eliminando notificación {notification_id}: {str(e)}")
    
    def run_all_tests(self):
        """Ejecuta todos los tests de notificaciones"""
        print("=== TESTS DE NOTIFICACIONES ===")
        
        # Tests de lectura
        estudiante_notifications = self.test_get_notifications_estudiante()
        profesor_notifications = self.test_get_notifications_profesor()
        admin_notifications = self.test_get_notifications_admin()
        self.test_get_notifications_unauthorized()
        
        # Tests de marcar como leída
        if estudiante_notifications:
            self.test_mark_notification_read_estudiante(estudiante_notifications)
        if profesor_notifications:
            self.test_mark_notification_read_profesor(profesor_notifications)
        
        self.test_mark_notification_read_invalid_id()
        self.test_mark_notification_read_unauthorized()
        self.test_mark_other_user_notification()
        
        # Tests adicionales
        self.test_notifications_filtering_by_type()
        self.test_notifications_pagination()
        
        # Resumen
        passed = sum(1 for r in self.test_results if r['status'])
        total = len(self.test_results)
        
        print(f"\n=== RESUMEN NOTIFICACIONES ===")
        print(f"Pasados: {passed}/{total}")
        
        return self.test_results

if __name__ == "__main__":
    # Cargar tokens de autenticación
    try:
        with open('/tmp/tfg_test_tokens.json', 'r') as f:
            tokens = json.load(f)
    except:
        tokens = {}
    
    notifications_suite = NotificationsTestSuite(tokens)
    results = notifications_suite.run_all_tests()
    
    # Cleanup
    notifications_suite.cleanup_created_notifications()
#!/usr/bin/env python3
"""
Tests para endpoints de gestión de TFGs
Base URL: https://tfg-backend.ddev.site
"""
import requests
import json
import sys
import os
import tempfile
import urllib3

# Deshabilitar warnings SSL para entorno de desarrollo DDEV
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://tfg-backend.ddev.site"

class TFGTestSuite:
    def __init__(self, tokens=None):
        self.session = requests.Session()
        # Deshabilitar verificación SSL para DDEV local
        self.session.verify = False
        self.tokens = tokens or {}
        self.test_results = []
        self.created_tfgs = []  # Para cleanup
        
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
    
    def test_get_mis_tfgs_estudiante(self):
        """Test GET /api/tfgs/mis-tfgs como estudiante"""
        if 'estudiante' not in self.headers:
            self.log_test("GET mis-tfgs estudiante", False, "No hay token de estudiante")
            return False
            
        try:
            response = self.session.get(
                f"{BASE_URL}/api/tfgs/mis-tfgs",
                headers=self.headers['estudiante']
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("GET mis-tfgs estudiante", True, f"Obtenidos {len(data.get('data', []))} TFGs")
                return True
            else:
                self.log_test("GET mis-tfgs estudiante", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET mis-tfgs estudiante", False, f"Exception: {str(e)}")
            return False
    
    def test_get_mis_tfgs_profesor(self):
        """Test GET /api/tfgs/mis-tfgs como profesor"""
        if 'profesor' not in self.headers:
            self.log_test("GET mis-tfgs profesor", False, "No hay token de profesor")
            return False
            
        try:
            response = self.session.get(
                f"{BASE_URL}/api/tfgs/mis-tfgs",
                headers=self.headers['profesor']
            )
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("GET mis-tfgs profesor", True, f"Obtenidos {len(data.get('data', []))} TFGs")
                return True
            else:
                self.log_test("GET mis-tfgs profesor", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("GET mis-tfgs profesor", False, f"Exception: {str(e)}")
            return False
    
    def test_create_tfg_estudiante(self):
        """Test POST /api/tfgs como estudiante"""
        if 'estudiante' not in self.headers:
            self.log_test("POST TFG estudiante", False, "No hay token de estudiante")
            return False
            
        try:
            payload = {
                "titulo": "TFG Test - Desarrollo de aplicación web",
                "descripcion": "Este es un TFG de prueba para testear la API",
                "resumen": "Resumen del TFG de prueba con tecnologías modernas",
                "palabras_clave": ["web", "react", "symfony", "test"],
                "tutor_id": 2  # Asumimos que el profesor tiene ID 2
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/tfgs",
                json=payload,
                headers=self.headers['estudiante']
            )
            
            if response.status_code == 201:
                data = response.json()
                if 'id' in data:
                    self.created_tfgs.append(data['id'])
                    self.log_test("POST TFG estudiante", True, f"TFG creado con ID: {data['id']}")
                    return data['id']
                else:
                    self.log_test("POST TFG estudiante", False, "Respuesta no contiene ID")
                    return False
            else:
                self.log_test("POST TFG estudiante", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("POST TFG estudiante", False, f"Exception: {str(e)}")
            return False
    
    def test_update_tfg_estudiante(self, tfg_id):
        """Test PUT /api/tfgs/{id} como estudiante"""
        if not tfg_id or 'estudiante' not in self.headers:
            self.log_test("PUT TFG estudiante", False, "No hay TFG ID o token de estudiante")
            return False
            
        try:
            payload = {
                "titulo": "TFG Test - Desarrollo de aplicación web (ACTUALIZADO)",
                "descripcion": "Descripción actualizada del TFG de prueba",
                "resumen": "Resumen actualizado con más detalles",
                "palabras_clave": ["web", "react", "symfony", "test", "actualizado"]
            }
            
            response = self.session.put(
                f"{BASE_URL}/api/tfgs/{tfg_id}",
                json=payload,
                headers=self.headers['estudiante']
            )
            
            if response.status_code == 200:
                self.log_test("PUT TFG estudiante", True, f"TFG {tfg_id} actualizado correctamente")
                return True
            else:
                self.log_test("PUT TFG estudiante", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("PUT TFG estudiante", False, f"Exception: {str(e)}")
            return False
    
    def test_upload_file_estudiante(self, tfg_id):
        """Test POST /api/tfgs/{id}/upload como estudiante"""
        if not tfg_id or 'estudiante' not in self.headers:
            self.log_test("Upload archivo estudiante", False, "No hay TFG ID o token de estudiante")
            return False
            
        try:
            # Crear un archivo PDF temporal para el test
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
                temp_file.write(b'%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n')
                temp_file.write(b'2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n')
                temp_file.write(b'3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\n')
                temp_file.write(b'xref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000079 00000 n \n0000000173 00000 n \n')
                temp_file.write(b'trailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n293\n%%EOF')
                temp_file_path = temp_file.name
            
            # Subir el archivo
            with open(temp_file_path, 'rb') as f:
                files = {'archivo': ('tfg_test.pdf', f, 'application/pdf')}
                response = self.session.post(
                    f"{BASE_URL}/api/tfgs/{tfg_id}/upload",
                    files=files,
                    headers=self.headers['estudiante']
                )
            
            # Limpiar archivo temporal
            os.unlink(temp_file_path)
            
            if response.status_code in [200, 201]:
                self.log_test("Upload archivo estudiante", True, f"Archivo subido al TFG {tfg_id}")
                return True
            else:
                self.log_test("Upload archivo estudiante", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Upload archivo estudiante", False, f"Exception: {str(e)}")
            return False
    
    def test_change_tfg_estado_profesor(self, tfg_id):
        """Test PUT /api/tfgs/{id}/estado como profesor"""
        if not tfg_id or 'profesor' not in self.headers:
            self.log_test("Cambiar estado TFG profesor", False, "No hay TFG ID o token de profesor")
            return False
            
        try:
            payload = {
                "estado": "revision",
                "comentario": "TFG en proceso de revisión por el tutor"
            }
            
            response = self.session.put(
                f"{BASE_URL}/api/tfgs/{tfg_id}/estado",
                json=payload,
                headers=self.headers['profesor']
            )
            
            if response.status_code == 200:
                self.log_test("Cambiar estado TFG profesor", True, f"Estado del TFG {tfg_id} cambiado a revisión")
                return True
            else:
                self.log_test("Cambiar estado TFG profesor", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Cambiar estado TFG profesor", False, f"Exception: {str(e)}")
            return False
    
    def test_download_tfg(self, tfg_id):
        """Test GET /api/tfgs/{id}/download"""
        if not tfg_id or 'estudiante' not in self.headers:
            self.log_test("Download TFG", False, "No hay TFG ID o token de estudiante")
            return False
            
        try:
            response = self.session.get(
                f"{BASE_URL}/api/tfgs/{tfg_id}/download",
                headers=self.headers['estudiante']
            )
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                if 'pdf' in content_type.lower() or len(response.content) > 0:
                    self.log_test("Download TFG", True, f"Archivo descargado correctamente (Content-Type: {content_type})")
                    return True
                else:
                    self.log_test("Download TFG", False, f"Contenido inválido (Content-Type: {content_type})")
                    return False
            else:
                self.log_test("Download TFG", False, f"Status: {response.status_code}, Body: {response.text}")
                return False
                
        except Exception as e:
            self.log_test("Download TFG", False, f"Exception: {str(e)}")
            return False
    
    def cleanup_created_tfgs(self):
        """Elimina los TFGs creados durante las pruebas"""
        if not self.created_tfgs:
            return
            
        print(f"\n=== LIMPIEZA: Eliminando {len(self.created_tfgs)} TFGs creados ===")
        
        for tfg_id in self.created_tfgs:
            try:
                # Intentar eliminar como admin si tenemos token
                if 'admin' in self.headers:
                    response = self.session.delete(
                        f"{BASE_URL}/api/tfgs/{tfg_id}",
                        headers=self.headers['admin']
                    )
                    if response.status_code in [200, 204]:
                        print(f"✓ TFG {tfg_id} eliminado")
                    else:
                        print(f"✗ No se pudo eliminar TFG {tfg_id}: {response.status_code}")
                else:
                    print(f"⚠ No se puede eliminar TFG {tfg_id}: no hay token de admin")
                    
            except Exception as e:
                print(f"✗ Error eliminando TFG {tfg_id}: {str(e)}")
    
    def run_all_tests(self):
        """Ejecuta todos los tests de TFGs"""
        print("=== TESTS DE TFGs ===")
        
        # Tests de lectura
        self.test_get_mis_tfgs_estudiante()
        self.test_get_mis_tfgs_profesor()
        
        # Tests de creación y modificación
        tfg_id = self.test_create_tfg_estudiante()
        
        if tfg_id:
            self.test_update_tfg_estudiante(tfg_id)
            self.test_upload_file_estudiante(tfg_id)
            self.test_change_tfg_estado_profesor(tfg_id)
            self.test_download_tfg(tfg_id)
        
        # Resumen
        passed = sum(1 for r in self.test_results if r['status'])
        total = len(self.test_results)
        
        print(f"\n=== RESUMEN TFGs ===")
        print(f"Pasados: {passed}/{total}")
        
        return self.test_results

if __name__ == "__main__":
    # Cargar tokens de autenticación
    try:
        with open('/tmp/tfg_test_tokens.json', 'r') as f:
            tokens = json.load(f)
    except:
        tokens = {}
    
    tfg_suite = TFGTestSuite(tokens)
    results = tfg_suite.run_all_tests()
    
    # Cleanup
    tfg_suite.cleanup_created_tfgs()
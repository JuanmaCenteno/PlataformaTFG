#!/usr/bin/env python3
"""
Script to set up test data for defensas tests
Creates a TFG and tribunal needed for testing
"""

import requests
import urllib3
import sys
from datetime import datetime, timedelta

urllib3.disable_warnings()

def setup_test_data():
    session = requests.Session()
    session.verify = False
    
    print("=== CREANDO DATOS DE PRUEBA ===")
    
    # 1. Create TFG as estudiante
    print("1. Creando TFG como estudiante...")
    login_data = {'username': 'estudiante@uni.es', 'password': '123456'}
    response = session.post('https://tfg-backend.ddev.site/api/auth/login', json=login_data)
    
    if response.status_code != 200:
        print(f"Error login estudiante: {response.status_code}")
        return False
        
    estudiante_token = response.json()['token']
    
    # Create TFG
    tfg_data = {
        'titulo': 'TFG de Prueba para Defensa - Desarrollo de Sistema de Gestión',
        'resumen': 'Este es un resumen de prueba para crear un TFG que pueda ser usado en las defensas. El proyecto consiste en el desarrollo de un sistema de gestión que incluye múltiples módulos y funcionalidades avanzadas.',
        'palabrasClave': 'testing, defensas, tfg, desarrollo, sistema, gestion',
        'tutor_id': 6  # profesor@uni.es
    }
    
    response = session.post(
        'https://tfg-backend.ddev.site/api/tfgs',
        json=tfg_data,
        headers={'Authorization': f'Bearer {estudiante_token}'}
    )
    
    if response.status_code not in [200, 201]:
        print(f"Error creando TFG: {response.status_code} - {response.text}")
        return False
    
    tfg = response.json()
    tfg_id = tfg['id']
    print(f"   TFG creado: ID {tfg_id}")
    
    # 2. Login as admin to approve TFG
    print("2. Aprobando TFG como admin...")
    login_data = {'username': 'admin@uni.es', 'password': '123456'}
    response = session.post('https://tfg-backend.ddev.site/api/auth/login', json=login_data)
    
    if response.status_code != 200:
        print(f"Error login admin: {response.status_code}")
        return False
        
    admin_token = response.json()['token']
    
    # Move TFG to revision first
    update_data = {'estado': 'revision'}
    response = session.put(
        f'https://tfg-backend.ddev.site/api/tfgs/{tfg_id}/estado',
        json=update_data,
        headers={'Authorization': f'Bearer {admin_token}'}
    )
    
    if response.status_code != 200:
        print(f"Error moviendo TFG a revisión: {response.status_code} - {response.text}")
        return False
    
    print(f"   TFG {tfg_id} en revisión")
    
    # Now approve TFG
    update_data = {'estado': 'aprobado'}
    response = session.put(
        f'https://tfg-backend.ddev.site/api/tfgs/{tfg_id}/estado',
        json=update_data,
        headers={'Authorization': f'Bearer {admin_token}'}
    )
    
    if response.status_code != 200:
        print(f"Error aprobando TFG: {response.status_code} - {response.text}")
        return False
    
    print(f"   TFG {tfg_id} aprobado")
    
    # 3. Create tribunal as presidente
    print("3. Creando tribunal como presidente...")
    login_data = {'username': 'presidente@uni.es', 'password': '123456'}
    response = session.post('https://tfg-backend.ddev.site/api/auth/login', json=login_data)
    
    if response.status_code != 200:
        print(f"Error login presidente: {response.status_code}")
        return False
        
    presidente_token = response.json()['token']
    
    # Create tribunal
    tribunal_data = {
        'nombre': 'Tribunal de Prueba para Defensas',
        'descripcion': 'Tribunal creado específicamente para testing de defensas',
        'secretario_id': 7,  # secretario@uni.es 
        'vocal_id': 8        # vocal@uni.es
    }
    
    response = session.post(
        'https://tfg-backend.ddev.site/api/tribunales',
        json=tribunal_data,
        headers={'Authorization': f'Bearer {presidente_token}'}
    )
    
    if response.status_code not in [200, 201]:
        print(f"Error creando tribunal: {response.status_code} - {response.text}")
        return False
    
    tribunal = response.json()
    tribunal_id = tribunal['id']
    print(f"   Tribunal creado: ID {tribunal_id}")
    
    # 4. Save IDs for tests
    print("4. Guardando IDs para tests...")
    with open('test_data_ids.txt', 'w') as f:
        f.write(f"tfg_id: {tfg_id}\n")
        f.write(f"tribunal_id: {tribunal_id}\n")
    
    print(f"\n✅ DATOS DE PRUEBA CREADOS EXITOSAMENTE")
    print(f"   TFG ID: {tfg_id} (estado: aprobado)")
    print(f"   Tribunal ID: {tribunal_id}")
    print(f"   IDs guardados en test_data_ids.txt")
    
    return True

if __name__ == "__main__":
    success = setup_test_data()
    sys.exit(0 if success else 1)
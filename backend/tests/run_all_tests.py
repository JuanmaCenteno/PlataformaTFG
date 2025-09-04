#!/usr/bin/env python3
"""
Script principal para ejecutar todos los tests de la API TFG
Ejecuta todos los endpoints de la plataforma y limpia los datos de prueba
Base URL: https://tfg-backend.ddev.site
"""

import sys
import os
import json
import time
from datetime import datetime

# Agregar el directorio de tests al path para imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Imports de todos los test suites
from auth.auth_test import AuthTestSuite
from tfgs.tfgs_test import TFGTestSuite
from tribunales.tribunales_test import TribunalesTestSuite
from defensas.defensas_test import DefensasTestSuite
from users.users_test import UsersTestSuite
from notifications.notifications_test import NotificationsTestSuite

class TFGTestRunner:
    def __init__(self):
        self.start_time = datetime.now()
        self.all_results = {}
        self.tokens = {}
        
    def print_header(self):
        """Imprime el header del test runner"""
        print("=" * 80)
        print("🧪 TEST RUNNER - PLATAFORMA TFG API")
        print("=" * 80)
        print(f"📅 Fecha: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"🌐 Base URL: https://tfg-backend.ddev.site")
        print(f"📋 Tests a ejecutar:")
        print("   ✓ Autenticación (5 tests)")
        print("   ✓ Gestión TFGs (8 tests)")
        print("   ✓ Gestión Tribunales (8 tests)")
        print("   ✓ Gestión Defensas (9 tests)")
        print("   ✓ Gestión Usuarios (13 tests)")
        print("   ✓ Sistema Notificaciones (11 tests)")
        print("=" * 80)
        print()
    
    def run_auth_tests(self):
        """Ejecuta los tests de autenticación"""
        print("🔐 INICIANDO TESTS DE AUTENTICACIÓN")
        print("-" * 50)
        
        auth_suite = AuthTestSuite()
        tokens, results = auth_suite.run_all_tests()
        
        self.tokens = tokens
        self.all_results['auth'] = results
        
        print("-" * 50)
        print()
        return tokens
    
    def run_tfgs_tests(self):
        """Ejecuta los tests de TFGs"""
        print("📄 INICIANDO TESTS DE TFGs")
        print("-" * 50)
        
        tfg_suite = TFGTestSuite(self.tokens)
        results = tfg_suite.run_all_tests()
        
        self.all_results['tfgs'] = results
        
        # Cleanup
        print("\n🧹 LIMPIEZA DE TFGs:")
        tfg_suite.cleanup_created_tfgs()
        
        print("-" * 50)
        print()
    
    def run_tribunales_tests(self):
        """Ejecuta los tests de Tribunales"""
        print("⚖️ INICIANDO TESTS DE TRIBUNALES")
        print("-" * 50)
        
        tribunales_suite = TribunalesTestSuite(self.tokens)
        results = tribunales_suite.run_all_tests()
        
        self.all_results['tribunales'] = results
        
        # Cleanup
        print("\n🧹 LIMPIEZA DE TRIBUNALES:")
        tribunales_suite.cleanup_created_tribunales()
        
        print("-" * 50)
        print()
    
    def run_defensas_tests(self):
        """Ejecuta los tests de Defensas"""
        print("🛡️ INICIANDO TESTS DE DEFENSAS")
        print("-" * 50)
        
        defensas_suite = DefensasTestSuite(self.tokens)
        results = defensas_suite.run_all_tests()
        
        self.all_results['defensas'] = results
        
        # Cleanup
        print("\n🧹 LIMPIEZA DE DEFENSAS:")
        defensas_suite.cleanup_created_defensas()
        
        print("-" * 50)
        print()
    
    def run_users_tests(self):
        """Ejecuta los tests de Usuarios"""
        print("👥 INICIANDO TESTS DE USUARIOS")
        print("-" * 50)
        
        users_suite = UsersTestSuite(self.tokens)
        results = users_suite.run_all_tests()
        
        self.all_results['users'] = results
        
        # Cleanup
        print("\n🧹 LIMPIEZA DE USUARIOS:")
        users_suite.cleanup_created_users()
        
        print("-" * 50)
        print()
    
    def run_notifications_tests(self):
        """Ejecuta los tests de Notificaciones"""
        print("🔔 INICIANDO TESTS DE NOTIFICACIONES")
        print("-" * 50)
        
        notifications_suite = NotificationsTestSuite(self.tokens)
        results = notifications_suite.run_all_tests()
        
        self.all_results['notifications'] = results
        
        # Cleanup (aunque las notificaciones normalmente no se eliminan)
        print("\n🧹 LIMPIEZA DE NOTIFICACIONES:")
        notifications_suite.cleanup_created_notifications()
        
        print("-" * 50)
        print()
    
    def print_final_summary(self):
        """Imprime el resumen final de todos los tests"""
        end_time = datetime.now()
        duration = end_time - self.start_time
        
        print("=" * 80)
        print("📊 RESUMEN FINAL DE TODOS LOS TESTS")
        print("=" * 80)
        
        total_passed = 0
        total_tests = 0
        
        # Resumen por módulo
        for module_name, results in self.all_results.items():
            passed = sum(1 for r in results if r['status'])
            total = len(results)
            
            total_passed += passed
            total_tests += total
            
            status_icon = "✅" if passed == total else "❌" if passed == 0 else "⚠️"
            module_display = {
                'auth': 'Autenticación',
                'tfgs': 'TFGs',
                'tribunales': 'Tribunales', 
                'defensas': 'Defensas',
                'users': 'Usuarios',
                'notifications': 'Notificaciones'
            }.get(module_name, module_name.capitalize())
            
            print(f"{status_icon} {module_display:<15}: {passed:>2}/{total:<2} tests pasados")
        
        print("-" * 80)
        
        # Resumen global
        success_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
        overall_status = "✅ ÉXITO" if total_passed == total_tests else "❌ FALLOS DETECTADOS"
        
        print(f"🏆 RESULTADO GLOBAL: {overall_status}")
        print(f"📈 Tests pasados: {total_passed}/{total_tests} ({success_rate:.1f}%)")
        print(f"⏱️ Duración: {duration.total_seconds():.1f} segundos")
        print(f"🕐 Finalizado: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        print("=" * 80)
        
        # Detalles de fallos si los hay
        if total_passed < total_tests:
            print("❌ DETALLES DE TESTS FALLIDOS:")
            print("-" * 80)
            
            for module_name, results in self.all_results.items():
                failed_tests = [r for r in results if not r['status']]
                if failed_tests:
                    module_display = {
                        'auth': 'Autenticación',
                        'tfgs': 'TFGs',
                        'tribunales': 'Tribunales',
                        'defensas': 'Defensas', 
                        'users': 'Usuarios',
                        'notifications': 'Notificaciones'
                    }.get(module_name, module_name.capitalize())
                    
                    print(f"\n🔴 {module_display}:")
                    for test in failed_tests:
                        print(f"  • {test['test']}: {test['details']}")
            
            print("=" * 80)
        
        # Limpieza final
        self.cleanup_temp_files()
        
        return total_passed, total_tests
    
    def cleanup_temp_files(self):
        """Limpia archivos temporales creados durante los tests"""
        print("\n🧹 LIMPIEZA FINAL:")
        
        temp_files = [
            '/tmp/tfg_test_tokens.json'
        ]
        
        for temp_file in temp_files:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
                    print(f"✓ Eliminado: {temp_file}")
                else:
                    print(f"ℹ️ No existe: {temp_file}")
            except Exception as e:
                print(f"✗ Error eliminando {temp_file}: {str(e)}")
    
    def save_results_report(self):
        """Guarda un reporte detallado de los resultados"""
        try:
            report = {
                'timestamp': self.start_time.isoformat(),
                'duration_seconds': (datetime.now() - self.start_time).total_seconds(),
                'base_url': 'https://tfg-backend.ddev.site',
                'results': self.all_results,
                'summary': {
                    'total_tests': sum(len(results) for results in self.all_results.values()),
                    'total_passed': sum(sum(1 for r in results if r['status']) for results in self.all_results.values()),
                    'modules': {
                        module: {
                            'total': len(results),
                            'passed': sum(1 for r in results if r['status'])
                        }
                        for module, results in self.all_results.items()
                    }
                }
            }
            
            report_file = f"/tmp/tfg_test_report_{self.start_time.strftime('%Y%m%d_%H%M%S')}.json"
            with open(report_file, 'w') as f:
                json.dump(report, f, indent=2, ensure_ascii=False)
            
            print(f"📄 Reporte guardado en: {report_file}")
            
        except Exception as e:
            print(f"⚠️ No se pudo guardar el reporte: {str(e)}")
    
    def run_all_tests(self):
        """Ejecuta todos los tests en orden"""
        self.print_header()
        
        try:
            # 1. Autenticación (requerida para los demás tests)
            tokens = self.run_auth_tests()
            
            if not tokens:
                print("❌ FALLO CRÍTICO: No se pudieron obtener tokens de autenticación")
                print("   Los tests restantes no se pueden ejecutar sin autenticación")
                return False
            
            # 2. Tests de funcionalidad principal
            self.run_tfgs_tests()
            self.run_tribunales_tests()
            self.run_defensas_tests()
            self.run_users_tests()
            self.run_notifications_tests()
            
            # 3. Resumen final
            passed, total = self.print_final_summary()
            
            # 4. Guardar reporte
            self.save_results_report()
            
            # 5. Exit code
            return passed == total
            
        except KeyboardInterrupt:
            print("\n\n⚠️ TESTS INTERRUMPIDOS POR EL USUARIO")
            print("🧹 Ejecutando limpieza de emergencia...")
            self.cleanup_temp_files()
            return False
            
        except Exception as e:
            print(f"\n\n❌ ERROR INESPERADO: {str(e)}")
            print("🧹 Ejecutando limpieza de emergencia...")
            self.cleanup_temp_files()
            return False

def main():
    """Función principal"""
    runner = TFGTestRunner()
    
    try:
        success = runner.run_all_tests()
        
        if success:
            print("\n🎉 ¡TODOS LOS TESTS COMPLETADOS EXITOSAMENTE!")
            print("✅ La API está funcionando correctamente")
            sys.exit(0)
        else:
            print("\n💥 ALGUNOS TESTS HAN FALLADO")
            print("❌ Revisar los detalles arriba para más información")
            sys.exit(1)
            
    except Exception as e:
        print(f"\n💥 ERROR FATAL: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
#!/bin/bash

# 🚀 SCRIPT DE PRUEBA RÁPIDA - TFG ENDPOINTS
echo "=== PROBANDO ENDPOINTS DE TFG ==="

BASE_URL="http://localhost:8000"

echo "1️⃣ Login como estudiante..."
RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "estudiante@uni.es", "password": "123456"}')

TOKEN_ESTUDIANTE=$(echo $RESPONSE | jq -r '.token')
echo "✅ Token estudiante obtenido"

echo "2️⃣ Creando TFG..."
TFG_RESPONSE=$(curl -s -X POST $BASE_URL/api/tfgs \
  -H "Authorization: Bearer $TOKEN_ESTUDIANTE" \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Mi TFG de Prueba",
    "descripcion": "Descripción de prueba",
    "resumen": "Resumen de prueba", 
    "palabras_clave": ["test", "prueba"],
    "tutor_id": 2
  }')

TFG_ID=$(echo $TFG_RESPONSE | jq -r '.id')
echo "✅ TFG creado con ID: $TFG_ID"

echo "3️⃣ Consultando mis TFGs como estudiante..."
curl -s -X GET $BASE_URL/api/tfgs/mis-tfgs \
  -H "Authorization: Bearer $TOKEN_ESTUDIANTE" | jq '.'

echo "4️⃣ Login como profesor..."
PROF_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "profesor@uni.es", "password": "123456"}')

TOKEN_PROFESOR=$(echo $PROF_RESPONSE | jq -r '.token')
echo "✅ Token profesor obtenido"

echo "5️⃣ Enviando TFG a revisión..."
curl -s -X PUT $BASE_URL/api/tfgs/$TFG_ID/estado \
  -H "Authorization: Bearer $TOKEN_PROFESOR" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "revision",
    "comentario": "Enviado a revisión para mejoras"
  }' | jq '.'

echo "6️⃣ Consultando TFGs como profesor..."
curl -s -X GET $BASE_URL/api/tfgs/mis-tfgs \
  -H "Authorization: Bearer $TOKEN_PROFESOR" | jq '.'

echo "7️⃣ Probando error 403 - Estudiante intenta cambiar estado..."
curl -s -X PUT $BASE_URL/api/tfgs/$TFG_ID/estado \
  -H "Authorization: Bearer $TOKEN_ESTUDIANTE" \
  -H "Content-Type: application/json" \
  -d '{"estado": "aprobado"}' | jq '.'

echo "🎉 PRUEBAS COMPLETADAS"
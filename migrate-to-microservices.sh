#!/bin/bash

# Vet App Microservices Migration Script
# Acest script ajută la migrarea de la aplicația monolitică la microservicii

echo "🏥 Vet App - Migrare la Microservicii"
echo "===================================="

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker nu este instalat. Te rog să instalezi Docker mai întâi."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose nu este instalat. Te rog să instalezi Docker Compose mai întâi."
    exit 1
fi

echo "✅ Docker și Docker Compose sunt instalate"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creez fișierul .env din template..."
    cp .env.example .env
    echo "⚠️  Te rog să editezi fișierul .env cu configurațiile tale."
    echo "   Setează în special:"
    echo "   - DB_PASSWORD (parola pentru baza de date)"
    echo "   - JWT_SECRET (cheie secretă pentru JWT)"
    echo "   - EMAIL_* (configurații pentru email)"
    read -p "Apasă Enter după ce ai editat .env pentru a continua..."
fi

echo "✅ Fișierul .env există"

# Choose deployment mode
echo ""
echo "Alege modul de deployment:"
echo "1) Development (cu hot reload și volume mounting)"
echo "2) Production (optimizat pentru producție)"
read -p "Introdu opțiunea (1 sau 2): " mode

if [ "$mode" = "1" ]; then
    COMPOSE_FILE="docker-compose.dev.yml"
    echo "🔧 Mod dezvoltare selectat"
elif [ "$mode" = "2" ]; then
    COMPOSE_FILE="docker-compose.yml"
    echo "🚀 Mod producție selectat"
else
    echo "❌ Opțiune invalidă"
    exit 1
fi

# Stop any existing containers
echo ""
echo "🛑 Opresc container-ele existente..."
docker-compose -f docker-compose.yml down 2>/dev/null || true
docker-compose -f docker-compose.dev.yml down 2>/dev/null || true

# Build and start services
echo ""
echo "🏗️  Construiesc și pornesc serviciile..."
docker-compose -f $COMPOSE_FILE up --build -d

# Wait for services to start
echo ""
echo "⏳ Aștept ca serviciile să pornească..."
sleep 30

# Check service health
echo ""
echo "🔍 Verific starea serviciilor..."

# PostgreSQL
if docker-compose -f $COMPOSE_FILE exec -T postgres pg_isready -U vet_user -d vet_app_db >/dev/null 2>&1; then
    echo "✅ PostgreSQL: OK"
else
    echo "❌ PostgreSQL: FAILED"
fi

# User Service
if curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
    echo "✅ User Service: OK"
else
    echo "❌ User Service: FAILED"
fi

# Pet Service
if curl -s http://localhost:3002/api/health >/dev/null 2>&1; then
    echo "✅ Pet Service: OK"
else
    echo "❌ Pet Service: FAILED"
fi

# Notification Service
if curl -s http://localhost:3003/api/health >/dev/null 2>&1; then
    echo "✅ Notification Service: OK"
else
    echo "❌ Notification Service: FAILED"
fi

# Frontend
if curl -s http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: FAILED"
fi

echo ""
echo "🎉 Migrarea completă!"
echo ""
echo "📱 Aplicația este disponibilă la:"
echo "   Frontend: http://localhost:3000"
if [ "$COMPOSE_FILE" = "docker-compose.yml" ]; then
    echo "   Nginx Proxy: http://localhost (dacă este configurat)"
fi
echo ""
echo "🔧 API Endpoints:"
echo "   User Service: http://localhost:3001"
echo "   Pet Service: http://localhost:3002"
echo "   Notification Service: http://localhost:3003"
echo ""
echo "📊 Pentru a vedea log-urile:"
echo "   docker-compose -f $COMPOSE_FILE logs -f"
echo ""
echo "🛑 Pentru a opri serviciile:"
echo "   docker-compose -f $COMPOSE_FILE down"
echo ""
echo "💾 Pentru backup baza de date:"
echo "   docker-compose -f $COMPOSE_FILE exec postgres pg_dump -U vet_user vet_app_db > backup.sql"
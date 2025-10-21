#!/bin/bash

# Script simplu pentru rularea aplicației Vet
# Rulează: ./run-app.sh

# Add Docker to PATH if needed
if ! command -v docker &> /dev/null; then
    export PATH="/Applications/Docker.app/Contents/Resources/bin:$PATH"
fi

# Use docker compose (new syntax) instead of docker-compose
DOCKER_COMPOSE="docker compose"

echo "🏥 Pornesc Aplicația Veterinară..."
echo "================================"

# Verifică dacă există .env
if [ ! -f ".env" ]; then
    echo "📝 Creez fișierul .env..."
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANT: Editează fișierul .env cu configurațiile tale!"
    echo "   Setează în special DB_PASSWORD și JWT_SECRET"
    echo ""
    read -p "Apasă Enter după ce ai editat .env..."
fi

# Oprește container-ele existente
echo "🛑 Opresc container-ele existente..."
$DOCKER_COMPOSE down 2>/dev/null || true

# Pornește aplicația
echo "🚀 Pornesc aplicația..."
$DOCKER_COMPOSE up --build -d

# Așteaptă puțin să pornească totul
echo "⏳ Aștept să pornească serviciile..."
sleep 20

# Verifică statusul
echo ""
echo "📊 Status servicii:"
$DOCKER_COMPOSE ps

echo ""
echo "🎉 Aplicația este pornită!"
echo ""
echo "📱 Accesează aplicația la: http://localhost:3000"
echo ""
echo "🔧 Pentru a vedea log-urile:"
echo "   docker compose logs -f"
echo ""
echo "🛑 Pentru a opri aplicația:"
echo "   docker compose down"
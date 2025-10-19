#!/bin/bash

# Script de Curățenie - Elimină Fișierele Vechi
echo "🧹 Curățenie Fișiere Vechi - Migrare Microservicii"
echo "=================================================="

echo ""
echo "⚠️  ATENȚIE: Acest script va elimina fișierele vechi după migrarea la microservicii"
echo "   Fișierele importante (schema DB, migrații) au fost deja mutate în ./database/"
echo ""

# Verifică că noile servicii există
if [ ! -d "user-service" ] || [ ! -d "pet-service" ] || [ ! -d "notification-service" ] || [ ! -d "frontend" ]; then
    echo "❌ Microserviciile nu par să fie create. Nu e sigur să șterg fișierele vechi."
    echo "   Asigură-te că ai directoarele: user-service, pet-service, notification-service, frontend"
    exit 1
fi

# Verifică că database/ directory există  
if [ ! -d "database" ]; then
    echo "❌ Directorul database/ nu există. Nu e sigur să șterg vet-app-backend/db/"
    exit 1
fi

echo "✅ Verificările de siguranță au trecut"
echo ""

# Afișează ce va fi șters
echo "📋 Fișierele/directoarele care vor fi ELIMINATE:"
echo "  - vet-app-frontend/ (înlocuit de frontend/)"
echo "  - vet-app-backend/src/ (migrat în microservicii)"
echo "  - vet-app-backend/tests/ (teste vechi)"
echo "  - vet-app-backend/package.json și node_modules/"
echo "  - vet-app-backend/.env (configurările au fost copiate)"
echo "  - package.json și node_modules/ din root (dacă există)"
echo ""

echo "📋 Fișierele care vor fi PĂSTRATE:"
echo "  - database/ (schema și migrații pentru Docker)"
echo "  - user-service/, pet-service/, notification-service/, frontend/"
echo "  - docker-compose.yml, Makefile, script-uri"
echo ""

read -p "Continui cu ștergerea? (scrie 'da' pentru confirmare): " confirm

if [ "$confirm" != "da" ]; then
    echo "❌ Curățenie anulată"
    exit 0
fi

echo ""
echo "🗑️  Încep curățenia..."

# Șterge vet-app-frontend complet
if [ -d "vet-app-frontend" ]; then
    echo "🗑️  Șterg vet-app-frontend/..."
    rm -rf vet-app-frontend/
    echo "✅ vet-app-frontend/ eliminat"
fi

# Șterge părți din vet-app-backend dar păstrează db/
if [ -d "vet-app-backend" ]; then
    echo "🗑️  Șterg părți din vet-app-backend/..."
    
    # Șterge src/
    if [ -d "vet-app-backend/src" ]; then
        rm -rf vet-app-backend/src/
        echo "✅ vet-app-backend/src/ eliminat"
    fi
    
    # Șterge tests/
    if [ -d "vet-app-backend/tests" ]; then
        rm -rf vet-app-backend/tests/
        echo "✅ vet-app-backend/tests/ eliminat"
    fi
    
    # Șterge node_modules și package files
    if [ -d "vet-app-backend/node_modules" ]; then
        rm -rf vet-app-backend/node_modules/
        echo "✅ vet-app-backend/node_modules/ eliminat"
    fi
    
    if [ -f "vet-app-backend/package.json" ]; then
        rm -f vet-app-backend/package.json
        echo "✅ vet-app-backend/package.json eliminat"
    fi
    
    if [ -f "vet-app-backend/package-lock.json" ]; then
        rm -f vet-app-backend/package-lock.json
        echo "✅ vet-app-backend/package-lock.json eliminat"
    fi
    
    if [ -f "vet-app-backend/.env" ]; then
        rm -f vet-app-backend/.env
        echo "✅ vet-app-backend/.env eliminat (configurările au fost copiate)"
    fi
    
    # Verifică dacă mai sunt fișiere în vet-app-backend
    remaining=$(find vet-app-backend -type f 2>/dev/null | wc -l)
    if [ $remaining -eq 0 ]; then
        rm -rf vet-app-backend/
        echo "✅ vet-app-backend/ eliminat complet (era gol)"
    else
        echo "ℹ️  vet-app-backend/ păstrat (mai conține $(find vet-app-backend -type f | wc -l) fișiere)"
    fi
fi

# Șterge package.json din root dacă există
if [ -f "package.json" ]; then
    echo "🗑️  Șterg package.json din root..."
    rm -f package.json
    echo "✅ package.json din root eliminat"
fi

if [ -f "package-lock.json" ]; then
    rm -f package-lock.json
    echo "✅ package-lock.json din root eliminat"
fi

if [ -d "node_modules" ]; then
    echo "🗑️  Șterg node_modules din root..."
    rm -rf node_modules/
    echo "✅ node_modules din root eliminat"
fi

echo ""
echo "🎉 Curățenie completă!"
echo ""
echo "📊 Structura finală:"
ls -la | grep "^d" | grep -v "^\.$" | grep -v "^\.git"

echo ""
echo "✅ Fișierele vechi au fost eliminate cu succes!"
echo "📱 Aplicația cu microservicii este gata să ruleze cu:"
echo "   ./run-app.sh"
echo "   sau"  
echo "   make start"
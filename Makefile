# Makefile pentru Aplicația Veterinară
# Utilizare: make <comanda>

.PHONY: help start stop restart logs clean status health setup dev prod

# Afișează comenzile disponibile
help:
	@echo "🏥 Aplicația Veterinară - Comenzi Disponibile:"
	@echo "============================================="
	@echo ""
	@echo "📦 Setup și Pornire:"
	@echo "  make setup    - Configurare inițială (creează .env)"
	@echo "  make start    - Pornește aplicația (producție)"
	@echo "  make dev      - Pornește în mod dezvoltare"
	@echo "  make prod     - Pornește în mod producție"
	@echo ""
	@echo "🔧 Management:"
	@echo "  make stop     - Oprește aplicația"
	@echo "  make restart  - Restart aplicația"
	@echo "  make status   - Verifică statusul serviciilor"
	@echo "  make logs     - Afișează log-urile"
	@echo "  make health   - Verifică health check-urile"
	@echo ""
	@echo "🧹 Curățenie:"
	@echo "  make clean    - Oprește și șterge container-ele"
	@echo "  make reset    - Reset complet (ATENȚIE: șterge datele!)"
	@echo "  make cleanup-old - Elimină fișierele vechi din migrare"
	@echo ""
	@echo "📱 Aplicația va fi disponibilă la: http://localhost:3000"

# Configurare inițială
setup:
	@echo "📝 Configurare inițială..."
	@if [ ! -f ".env" ]; then \
		cp .env.example .env; \
		echo "✅ Fișierul .env a fost creat din template"; \
		echo "⚠️  Te rog să editezi .env cu configurațiile tale"; \
	else \
		echo "✅ Fișierul .env există deja"; \
	fi

# Pornește aplicația (mod producție implicit)
start: setup
	@echo "🚀 Pornesc aplicația..."
	@docker-compose down 2>/dev/null || true
	@docker-compose up --build -d
	@echo "⏳ Aștept să pornească serviciile..."
	@sleep 15
	@make status
	@echo ""
	@echo "🎉 Aplicația este pornită!"
	@echo "📱 Accesează la: http://localhost:3000"

# Mod dezvoltare
dev: setup
	@echo "🔧 Pornesc aplicația în mod dezvoltare..."
	@docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
	@docker-compose -f docker-compose.dev.yml up --build -d
	@echo "⏳ Aștept să pornească serviciile..."
	@sleep 15
	@make status-dev
	@echo ""
	@echo "🎉 Aplicația în mod dezvoltare este pornită!"
	@echo "📱 Accesează la: http://localhost:3000"

# Mod producție explicit
prod: setup
	@echo "🏭 Pornesc aplicația în mod producție..."
	@docker-compose down 2>/dev/null || true
	@docker-compose up --build -d
	@echo "⏳ Aștept să pornească serviciile..."
	@sleep 15
	@make status
	@echo ""
	@echo "🎉 Aplicația în mod producție este pornită!"
	@echo "📱 Accesează la: http://localhost:3000"

# Oprește aplicația
stop:
	@echo "🛑 Opresc aplicația..."
	@docker-compose down 2>/dev/null || true
	@docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
	@echo "✅ Aplicația a fost oprită"

# Restart aplicația
restart: stop start

# Verifică statusul serviciilor
status:
	@echo "📊 Status servicii (producție):"
	@docker-compose ps

# Status pentru dezvoltare
status-dev:
	@echo "📊 Status servicii (dezvoltare):"
	@docker-compose -f docker-compose.dev.yml ps

# Afișează log-urile
logs:
	@echo "📋 Log-uri servicii:"
	@docker-compose logs -f

# Log-uri pentru dezvoltare
logs-dev:
	@echo "📋 Log-uri servicii (dezvoltare):"
	@docker-compose -f docker-compose.dev.yml logs -f

# Verifică health check-urile
health:
	@echo "🔍 Verificare health check-uri..."
	@echo ""
	@echo -n "PostgreSQL: "
	@if docker-compose exec -T postgres pg_isready -U vet_user -d vet_app_db >/dev/null 2>&1; then \
		echo "✅ OK"; \
	else \
		echo "❌ FAILED"; \
	fi
	@echo -n "User Service: "
	@if curl -s http://localhost:3001/api/health >/dev/null 2>&1; then \
		echo "✅ OK"; \
	else \
		echo "❌ FAILED"; \
	fi
	@echo -n "Pet Service: "
	@if curl -s http://localhost:3002/api/health >/dev/null 2>&1; then \
		echo "✅ OK"; \
	else \
		echo "❌ FAILED"; \
	fi
	@echo -n "Notification Service: "
	@if curl -s http://localhost:3003/api/health >/dev/null 2>&1; then \
		echo "✅ OK"; \
	else \
		echo "❌ FAILED"; \
	fi
	@echo -n "Frontend: "
	@if curl -s http://localhost:3000 >/dev/null 2>&1; then \
		echo "✅ OK"; \
	else \
		echo "❌ FAILED"; \
	fi

# Curățenie - oprește și șterge container-ele
clean:
	@echo "🧹 Curățenie container-e..."
	@docker-compose down --remove-orphans 2>/dev/null || true
	@docker-compose -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true
	@docker system prune -f
	@echo "✅ Curățenie completă"

# Reset complet - ATENȚIE: șterge și datele!
reset:
	@echo "⚠️  ATENȚIE: Aceasta va șterge TOATE datele!"
	@read -p "Ești sigur? (scrie 'da' pentru confirmare): " confirm; \
	if [ "$$confirm" = "da" ]; then \
		echo "🗑️  Reset complet..."; \
		docker-compose down -v --remove-orphans 2>/dev/null || true; \
		docker-compose -f docker-compose.dev.yml down -v --remove-orphans 2>/dev/null || true; \
		docker system prune -a -f; \
		echo "✅ Reset complet finalizat"; \
	else \
		echo "❌ Reset anulat"; \
	fi

# Backup baza de date
backup:
	@echo "💾 Backup baza de date..."
	@docker-compose exec postgres pg_dump -U vet_user vet_app_db > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup salvat în backup_$(shell date +%Y%m%d_%H%M%S).sql"

# Comenzi rapide
up: start
down: stop
ps: status

# Curățenie fișiere vechi
cleanup-old:
	@echo "🧹 Rulează script-ul de curățenie pentru fișierele vechi..."
	@./cleanup-old-files.sh
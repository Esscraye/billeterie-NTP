# Makefile pour Système de Réservation NTP

.PHONY: help setup dev prod test clean build logs

# Variables
DOCKER_COMPOSE = docker compose
BACKEND_DIR = backend
FRONTEND_DIR = frontend

# Couleurs pour l'affichage
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

help: ## Afficher cette aide
	@echo "$(GREEN)Système de Réservation de Billets - Commandes disponibles:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

setup: ## Installation initiale du projet
	@echo "$(GREEN)🚀 Installation du projet...$(NC)"
	@make setup-backend
	@make setup-frontend
	@make setup-docker
	@echo "$(GREEN)✅ Setup terminé !$(NC)"

setup-backend: ## Setup du backend FastAPI
	@echo "$(YELLOW)📦 Setup backend...$(NC)"
	@cd $(BACKEND_DIR) && python -m venv venv
	@cd $(BACKEND_DIR) && source venv/bin/activate && pip install -r requirements.txt

setup-frontend: ## Setup du frontend Next.js
	@echo "$(YELLOW)🌐 Setup frontend...$(NC)"
	@cd $(FRONTEND_DIR) && npm install

setup-docker: ## Setup des conteneurs Docker
	@echo "$(YELLOW)🐳 Setup Docker...$(NC)"
	@$(DOCKER_COMPOSE) build

dev: ## Lancer l'environnement de développement
	@echo "$(GREEN)🔧 Démarrage environnement de développement...$(NC)"
	@$(DOCKER_COMPOSE) up -d postgres
	@sleep 3
	@make dev-backend &
	@make dev-frontend &
	@echo "$(GREEN)✅ Environnement de développement lancé !$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:3000$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:8000$(NC)"
	@echo "$(YELLOW)API Docs: http://localhost:8000/docs$(NC)"

dev-backend: ## Lancer uniquement le backend
	@echo "$(YELLOW)🚀 Démarrage backend...$(NC)"
	@cd $(BACKEND_DIR) && source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend: ## Lancer uniquement le frontend
	@echo "$(YELLOW)🌐 Démarrage frontend...$(NC)"
	@cd $(FRONTEND_DIR) && npm run dev

prod: ## Lancer en mode production
	@echo "$(GREEN)🚀 Démarrage production...$(NC)"
	@$(DOCKER_COMPOSE) -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✅ Production lancée !$(NC)"

build: ## Build des images Docker
	@echo "$(GREEN)🔨 Build des images...$(NC)"
	@$(DOCKER_COMPOSE) build

logs: ## Afficher les logs
	@$(DOCKER_COMPOSE) logs -f

logs-backend: ## Logs backend uniquement
	@$(DOCKER_COMPOSE) logs -f backend

logs-frontend: ## Logs frontend uniquement
	@$(DOCKER_COMPOSE) logs -f frontend

simulation: ## Lancer la simulation NTP
	@echo "$(GREEN)⏰ Lancement simulation NTP...$(NC)"
	@cd simulation && python simulate_time_drift.py

clean: ## Nettoyer les conteneurs et volumes
	@echo "$(RED)🧹 Nettoyage...$(NC)"
	@$(DOCKER_COMPOSE) down -v
	@docker system prune -f

stop: ## Arrêter tous les services
	@echo "$(YELLOW)⏹️  Arrêt des services...$(NC)"
	@$(DOCKER_COMPOSE) down

restart: ## Redémarrer tous les services
	@echo "$(YELLOW)🔄 Redémarrage...$(NC)"
	@make stop
	@make dev

db-reset: ## Reset de la base de données
	@echo "$(RED)💥 Reset de la base de données...$(NC)"
	@$(DOCKER_COMPOSE) down -v postgres
	@$(DOCKER_COMPOSE) up -d postgres
	@sleep 5
	@cd $(BACKEND_DIR) && source venv/bin/activate && alembic upgrade head

migrate: ## Appliquer les migrations
	@echo "$(YELLOW)📊 Application des migrations...$(NC)"
	@cd $(BACKEND_DIR) && source venv/bin/activate && alembic upgrade head

new-migration: ## Créer une nouvelle migration
	@echo "$(YELLOW)📝 Création migration...$(NC)"
	@read -p "Nom de la migration: " name; \
	cd $(BACKEND_DIR) && source venv/bin/activate && alembic revision --autogenerate -m "$$name"

install: ## Installation rapide pour développement local
	@echo "$(GREEN)⚡ Installation rapide...$(NC)"
	@make setup
	@make dev

status: ## Afficher le statut des services
	@echo "$(GREEN)📊 Statut des services:$(NC)"
	@$(DOCKER_COMPOSE) ps

# Commandes par défaut
.DEFAULT_GOAL := help

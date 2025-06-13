# Système de Réservation de Billets - Démonstration NTP

Ce projet démontre l'importance de la synchronisation temporelle NTP dans un système de réservation de billets distribué.

## 🏗️ Architecture

```
ticket-reservation-ntp/
├── backend/                    # API FastAPI
├── frontend/                   # Interface Next.js
├── simulation/                 # Scripts de simulation NTP
├── docker/                     # Configurations Docker
├── docs/                       # Documentation
├── scripts/                    # Scripts utilitaires
├── Makefile                    # Commandes simplifiées
└── docker-compose.yml          # Orchestration services
```

## 🚀 Quick Start

```bash
# Installation et setup
make setup

# Développement
make dev

# Tests
make test

# Production
make prod
```

## 📚 Documentation

- [Guide de développement](docs/development.md)
- [API Documentation](docs/api.md)
- [Simulation NTP](docs/ntp-simulation.md)

## 🛠️ Technologies

- **Backend**: FastAPI + PostgreSQL + SQLAlchemy
- **Frontend**: Next.js + TypeScript + Tailwind CSS
- **Conteneurisation**: Docker + Docker Compose
- **Base de données**: PostgreSQL avec TimescaleDB

## 🎯 Objectifs

1. Démontrer les problèmes de synchronisation temporelle
2. Illustrer l'importance de NTP dans les systèmes distribués
3. Visualiser les conflits de réservation en temps réel
4. Comparer les comportements avec/sans synchronisation NTP

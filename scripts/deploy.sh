#!/bin/bash

# Script de déploiement automatique pour VPS

set -e

echo "🚀 Déploiement du Système de Réservation NTP..."

# Vérifier les prérequis
echo "📋 Vérification des prérequis..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    echo "Installation de Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installé"
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    echo "Installation de Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installé"
fi

# Configuration NTP
echo "🕐 Configuration NTP..."
if ! command -v ntpdate &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y ntp ntpdate
fi

sudo systemctl enable ntp
sudo systemctl start ntp
echo "✅ NTP configuré"

# Variables d'environnement
echo "⚙️  Configuration des variables d'environnement..."

if [ ! -f .env ]; then
    cat > .env << EOF
POSTGRES_PASSWORD=$(openssl rand -base64 32)
SECRET_KEY=$(openssl rand -base64 32)
API_URL=http://localhost:8000
ENVIRONMENT=production
EOF
    echo "✅ Fichier .env créé"
else
    echo "ℹ️  Fichier .env existant utilisé"
fi

# Build et démarrage
echo "🔨 Build des images Docker..."
docker-compose -f docker-compose.prod.yml build

echo "🚀 Démarrage des services..."
docker-compose -f docker-compose.prod.yml up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 30

# Vérification des services
echo "🔍 Vérification des services..."

if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Frontend accessible"
else
    echo "❌ Frontend non accessible"
fi

if curl -f http://localhost/api/seats > /dev/null 2>&1; then
    echo "✅ Backend accessible"
else
    echo "❌ Backend non accessible"
fi

# Initialisation des données
echo "📊 Initialisation des données..."
curl -X POST http://localhost/api/seats/initialize \
    -H "Content-Type: application/json" \
    -d '{"total_seats": 100}' > /dev/null 2>&1

echo "🎉 Déploiement terminé!"
echo ""
echo "📱 Application accessible sur:"
echo "   Frontend: http://localhost"
echo "   API Docs: http://localhost/docs"
echo "   Health:   http://localhost/health"
echo ""
echo "🔧 Commandes utiles:"
echo "   Logs:     docker-compose -f docker-compose.prod.yml logs -f"
echo "   Arrêt:    docker-compose -f docker-compose.prod.yml down"
echo "   Restart:  docker-compose -f docker-compose.prod.yml restart"

# Guide de Développement - Système de Réservation NTP

## Introduction

Ce guide fournit les informations nécessaires pour développer et contribuer au projet de démonstration du protocole NTP dans un système de réservation de billets.

## Prérequis

### Outils Requis

- **Docker** (>= 20.10) et **Docker Compose** (>= 2.0)
- **Python** (>= 3.11) pour le backend
- **Node.js** (>= 18) et **npm** pour le frontend
- **PostgreSQL** (fourni via Docker)

### Connaissances Recommandées

- Architectures microservices
- Protocoles de synchronisation temporelle
- Développement API REST (FastAPI)
- Frontend moderne (Next.js, React)

## Architecture du Projet

### Structure des Dossiers

```
projet/
├── backend/           # API FastAPI
│   ├── app/
│   │   ├── api/       # Endpoints REST
│   │   ├── core/      # Configuration et database
│   │   ├── models/    # Modèles SQLAlchemy
│   │   ├── schemas/   # Schémas Pydantic
│   │   └── services/  # Logique métier (NTP, etc.)
│   ├── tests/         # Tests unitaires et d'intégration
│   └── requirements.txt
├── frontend/          # Interface Next.js
│   ├── src/
│   │   ├── app/       # Pages Next.js 13+
│   │   ├── components/# Composants React
│   │   └── lib/       # Utilitaires (API client)
│   └── package.json
├── simulation/        # Scripts de simulation NTP
├── docker/           # Configurations Docker
└── docs/             # Documentation
```

### Services Principaux

#### Backend (FastAPI)

**Responsabilités** :
- API REST pour les réservations
- Gestion de la synchronisation NTP
- Simulation de dérive temporelle
- Détection et résolution des conflits

**Endpoints principaux** :
- `/api/seats` : Gestion des sièges
- `/api/reservations` : Système de réservation
- `/api/time` : Synchronisation NTP
- `/api/simulation` : Configuration de la simulation

#### Frontend (Next.js)

**Responsabilités** :
- Interface utilisateur pour les réservations
- Visualisation des conflits en temps réel
- Panneau de contrôle pour la simulation
- Monitoring de l'état NTP

**Composants clés** :
- `SeatsGrid` : Grille de sélection des sièges
- `ReservationForm` : Formulaire de réservation
- `SimulationPanel` : Contrôle des simulations
- `ConflictsList` : Affichage des conflits détectés

## Installation et Configuration

### Setup Initial

```bash
# Cloner le projet et accéder au dossier
cd projet/

# Installation complète avec Makefile
make setup

# Alternative manuelle
make setup-backend
make setup-frontend
make setup-docker
```

### Configuration Environnement

#### Variables d'Environnement

Créer un fichier `.env` dans `/backend/` :

```env
# Base de données
DATABASE_URL=postgresql+psycopg2://postgres:example@postgres:5432/ticketdb

# Sécurité
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Configuration NTP
NTP_SERVER=pool.ntp.org
TIME_SYNC_INTERVAL=300

# Simulation
MAX_SEATS=100
SIMULATION_ENABLED=true
```

#### Configuration Docker

Le fichier `docker-compose.yml` configure :
- PostgreSQL avec persistence
- Backend FastAPI avec hot-reload
- Frontend Next.js avec hot-reload
- Volumes partagés pour le développement

### Lancement des Services

#### Mode Développement

```bash
# Démarrage complet
make dev

# Services individuels
make dev-backend    # Backend uniquement
make dev-frontend   # Frontend uniquement
```

**URLs d'accès** :
- Frontend : http://localhost:3000
- Backend API : http://localhost:8000
- Documentation API : http://localhost:8000/docs

#### Mode Production

```bash
# Build et démarrage production
make prod

# Utilise docker-compose.prod.yml
```

## Développement

### Backend (FastAPI)

#### Structure des Services

##### Service NTP (`services/time_service.py`)

```python
def get_current_time(server_id: str = "server-1") -> Tuple[datetime, bool, float]:
    """
    Obtenir le temps actuel avec gestion des décalages simulés
    
    Returns:
        datetime: Timestamp actuel (ajusté si simulation)
        bool: État de synchronisation NTP
        float: Décalage en secondes (0 si synchronisé)
    """
```

**Fonctionnalités** :
- Synchronisation NTP réelle avec `ntplib`
- Simulation de dérive pour tests
- Gestion des décalages par serveur
- Monitoring de l'état de synchronisation

##### API Time (`api/time.py`)

```python
@router.get("/status", response_model=TimeStatusResponse)
def get_time_status(server_id: str = "server-1"):
    """Endpoint pour obtenir l'état de synchronisation"""
    
@router.post("/sync")
def force_ntp_sync(server_id: str = "server-1"):
    """Endpoint pour forcer une synchronisation NTP"""
```

#### Modèles de Données

##### Réservation

```python
class Reservation(Base):
    __tablename__ = "reservations"
    
    id = Column(Integer, primary_key=True)
    seat_id = Column(Integer, nullable=False)
    customer_name = Column(String, nullable=False)
    server_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Contrainte d'unicité pour éviter les conflits
    __table_args__ = (UniqueConstraint('seat_id', name='unique_seat'),)
```

#### Tests

##### Tests Unitaires

```python
# tests/test_time_service.py
def test_ntp_synchronization():
    """Test de synchronisation NTP basique"""
    success, offset = sync_with_ntp()
    assert success is True
    assert isinstance(offset, float)

def test_time_offset_simulation():
    """Test de simulation de décalage"""
    server_id = "test-server"
    offset = 5.0
    
    set_time_offset(server_id, offset)
    time, synced, actual_offset = get_current_time(server_id)
    
    assert synced is False
    assert actual_offset == offset
```

##### Tests d'Intégration

```python
# tests/test_reservations.py
async def test_concurrent_reservations():
    """Test de réservations concurrentes avec dérive temporelle"""
    # Configurer des décalages différents
    # Lancer des réservations simultanées
    # Vérifier la résolution des conflits
```

### Frontend (Next.js)

#### Structure des Composants

##### Grille des Sièges (`SeatsGrid.tsx`)

```tsx
interface Seat {
  id: number;
  is_available: boolean;
  reservation?: Reservation;
}

export default function SeatsGrid({ onSeatSelect }: Props) {
  // Gestion de l'état des sièges
  // Mise à jour en temps réel
  // Visualisation des conflits
}
```

##### Panneau de Simulation (`SimulationPanel.tsx`)

```tsx
interface SimulationState {
  offsets: Record<string, number>;
  scenarios: SimulationScenarios;
  loading: boolean;
}

export default function SimulationPanel({ onSuccess }: Props) {
  // Configuration des décalages par serveur
  // Application de scénarios prédéfinis
  // Monitoring en temps réel
}
```

#### Service API (`lib/api.ts`)

```typescript
class ApiService {
  async getSeats(): Promise<Seat[]> {
    // Récupération des sièges disponibles
  }
  
  async createReservation(data: ReservationCreate): Promise<Reservation> {
    // Création d'une réservation
  }
  
  async setTimeOffset(serverId: string, offset: number): Promise<void> {
    // Configuration de décalage temporel
  }
}
```

### Simulation et Tests

#### Script de Simulation (`simulation/simulate_time_drift.py`)

```python
class NTPSimulator:
    def __init__(self, api_base_url: str = "http://localhost:8000"):
        self.api_base_url = api_base_url
        self.servers = ["server-1", "server-2", "server-3", "server-4", "server-5"]
    
    async def setup_time_drift(self, scenario: str = "major_drift"):
        """Configure un scénario de dérive temporelle"""
        
    async def simulate_concurrent_reservations(self, seat_id: int, num_reservations: int = 3):
        """Simule des réservations concurrentes"""
```

**Scénarios Disponibles** :
- `minor_drift` : Décalages légers (< 2s)
- `major_drift` : Décalages significatifs (5-10s)
- `extreme_drift` : Décalages importants (> 15s)

#### Utilisation du Script

```bash
# Lancement de la simulation
make simulation

# Ou directement
cd simulation/
python simulate_time_drift.py
```

## Débogage et Monitoring

### Logs

#### Backend Logs

```bash
# Logs complets
make logs

# Logs backend uniquement
make logs-backend

# Logs avec suivi en temps réel
docker compose logs -f backend
```

#### Frontend Logs

```bash
# Logs frontend uniquement
make logs-frontend

# Console browser (F12)
# Logs de l'API client et des composants
```

### Monitoring NTP

#### Endpoints de Monitoring

```bash
# État de synchronisation d'un serveur
curl http://localhost:8000/api/time/status?server_id=server-1

# Liste des décalages configurés
curl http://localhost:8000/api/simulation/offsets
```

#### Dashboard de Monitoring

Le frontend propose un monitoring visuel :
- État de synchronisation par serveur
- Graphiques de dérive temporelle
- Historique des synchronisations
- Alertes en cas de problème

### Debugging des Conflits

#### Détection des Conflits

```python
# Dans les logs backend, rechercher :
# "CONFLIT DÉTECTÉ: Plusieurs réservations pour le siège X"

# Vérification manuelle en base
SELECT seat_id, COUNT(*) as conflicts 
FROM reservations 
GROUP BY seat_id 
HAVING COUNT(*) > 1;
```

#### Analyse des Timestamps

```python
# Comparaison des timestamps de réservation
SELECT r.*, ts.server_time_offset 
FROM reservations r
LEFT JOIN time_status ts ON r.server_id = ts.server_id
WHERE r.seat_id = X
ORDER BY r.created_at;
```

## Contribution

### Workflow de Développement

1. **Fork** et clone du repository
2. **Branche** pour la fonctionnalité : `feature/ma-fonctionnalite`
3. **Développement** avec tests
4. **Tests** : `make test`
5. **Pull Request** avec description détaillée

### Standards de Code

#### Backend (Python)

- **PEP 8** pour le style
- **Type hints** obligatoires
- **Docstrings** pour toutes les fonctions publiques
- **Tests unitaires** pour la logique métier

```python
async def sync_with_ntp(ntp_server: str = "pool.ntp.org") -> Tuple[bool, float]:
    """
    Synchroniser avec un serveur NTP.
    
    Args:
        ntp_server: URL du serveur NTP à utiliser
        
    Returns:
        Tuple contenant (succès, offset_en_secondes)
        
    Raises:
        NTPException: En cas d'erreur de synchronisation
    """
```

#### Frontend (TypeScript)

- **ESLint** et **Prettier** configurés
- **Types stricts** pour tous les props et états
- **Composants fonctionnels** avec hooks
- **Tests** avec Jest et React Testing Library

```tsx
interface ReservationFormProps {
  selectedSeat: number | null;
  onSubmit: (reservation: ReservationCreate) => Promise<void>;
  loading?: boolean;
}

export default function ReservationForm({ 
  selectedSeat, 
  onSubmit, 
  loading = false 
}: ReservationFormProps) {
  // Implementation
}
```

### Tests

#### Exécution des Tests

```bash
# Tests backend
cd backend/
python -m pytest tests/ -v

# Tests frontend
cd frontend/
npm test

# Tests d'intégration
make test
```

#### Couverture de Code

- **Backend** : Couverture > 80%
- **Frontend** : Tests des composants critiques
- **E2E** : Scénarios de réservation complets

## Déploiement

### Environnements

#### Développement Local

```bash
make dev
```

#### Staging

```bash
# Utilise docker-compose.staging.yml (à créer)
make staging
```

#### Production

```bash
make prod
# ou
docker compose -f docker-compose.prod.yml up -d
```

### Configuration Production

#### Sécurité

- **HTTPS** obligatoire
- **Authentification** NTP avec clés
- **Monitoring** et alerting actifs
- **Backup** réguliers de la base

#### Performance

- **Load balancing** pour l'API
- **CDN** pour les assets frontend
- **Cache** Redis pour les sessions
- **Monitoring** APM (Application Performance Monitoring)

## Troubleshooting

### Problèmes Courants

#### "Connection refused" lors du démarrage

```bash
# Vérifier que PostgreSQL est démarré
docker compose ps postgres

# Redémarrer si nécessaire
docker compose restart postgres
```

#### Erreurs de synchronisation NTP

```bash
# Vérifier la connectivité réseau
ping pool.ntp.org

# Tester manuellement
ntpdate -q pool.ntp.org
```

#### Conflits de ports

```bash
# Vérifier les ports utilisés
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000

# Modifier dans docker-compose.yml si nécessaire
```

### Support et Documentation

- **Issues GitHub** : Signalement de bugs
- **Discussions** : Questions et propositions
- **Wiki** : Documentation collaborative
- **API Docs** : http://localhost:8000/docs (en mode dev)

---

*Ce guide est vivant et évolue avec le projet. N'hésitez pas à proposer des améliorations !*

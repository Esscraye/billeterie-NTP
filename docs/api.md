# API Documentation - Système de Réservation NTP

## Introduction

Cette documentation décrit l'API REST du système de réservation de billets avec démonstration NTP. L'API est construite avec FastAPI et expose des endpoints pour la gestion des réservations, la synchronisation temporelle et la simulation de dérive NTP.

## URL de Base

- **Développement** : `http://localhost:8000`
- **Production** : `https://your-domain.com`

## Authentification

Actuellement, l'API fonctionne sans authentification pour simplifier les démonstrations. En production, il faudrait implémenter :
- Authentification JWT
- Rate limiting
- Validation des permissions

## Endpoints

### 1. Sièges (Seats)

#### GET /api/seats

Récupère la liste de tous les sièges disponibles.

**Réponse** :
```json
[
  {
    "id": 1,
    "row": "A",
    "number": 1,
    "is_available": true,
    "reservation": null
  },
  {
    "id": 2,
    "row": "A", 
    "number": 2,
    "is_available": false,
    "reservation": {
      "id": 1,
      "customer_name": "Jean Dupont",
      "server_id": "server-1",
      "created_at": "2025-06-28T10:30:00Z"
    }
  }
]
```

#### GET /api/seats/{seat_id}

Récupère les détails d'un siège spécifique.

**Paramètres** :
- `seat_id` (int) : ID du siège

**Réponse** :
```json
{
  "id": 1,
  "row": "A",
  "number": 1,
  "is_available": true,
  "reservation": null
}
```

**Codes d'erreur** :
- `404` : Siège non trouvé

### 2. Réservations (Reservations)

#### POST /api/reservations

Crée une nouvelle réservation.

**Corps de la requête** :
```json
{
  "seat_id": 1,
  "customer_name": "Jean Dupont",
  "server_id": "server-1"
}
```

**Réponse** (201 Created) :
```json
{
  "id": 1,
  "seat_id": 1,
  "customer_name": "Jean Dupont",
  "server_id": "server-1",
  "created_at": "2025-06-28T10:30:00Z",
  "conflict_detected": false
}
```

**Codes d'erreur** :
- `400` : Données invalides
- `409` : Siège déjà réservé (conflit)

#### GET /api/reservations

Récupère toutes les réservations.

**Paramètres de requête** :
- `seat_id` (optional) : Filtrer par siège
- `server_id` (optional) : Filtrer par serveur
- `limit` (optional, default=100) : Nombre max de résultats
- `offset` (optional, default=0) : Décalage pour pagination

**Réponse** :
```json
{
  "reservations": [
    {
      "id": 1,
      "seat_id": 1,
      "customer_name": "Jean Dupont",
      "server_id": "server-1",
      "created_at": "2025-06-28T10:30:00Z"
    }
  ],
  "total": 1,
  "limit": 100,
  "offset": 0
}
```

#### GET /api/reservations/{reservation_id}

Récupère une réservation spécifique.

**Réponse** :
```json
{
  "id": 1,
  "seat_id": 1,
  "customer_name": "Jean Dupont",
  "server_id": "server-1",
  "created_at": "2025-06-28T10:30:00Z"
}
```

#### DELETE /api/reservations/{reservation_id}

Annule une réservation.

**Réponse** (204 No Content)

#### GET /api/reservations/conflicts

Détecte les conflits de réservation (plusieurs réservations pour le même siège).

**Réponse** :
```json
{
  "conflicts": [
    {
      "seat_id": 1,
      "reservations": [
        {
          "id": 1,
          "customer_name": "Jean Dupont",
          "server_id": "server-1",
          "created_at": "2025-06-28T10:30:00Z"
        },
        {
          "id": 2,
          "customer_name": "Marie Martin",
          "server_id": "server-2",
          "created_at": "2025-06-28T10:30:05Z"
        }
      ],
      "conflict_count": 2
    }
  ],
  "total_conflicts": 1
}
```

### 3. Synchronisation Temporelle (Time)

#### GET /api/time/status

Obtient l'état de synchronisation temporelle d'un serveur.

**Paramètres de requête** :
- `server_id` (optional, default="server-1") : ID du serveur

**Réponse** :
```json
{
  "server_id": "server-1",
  "current_time": "2025-06-28T10:30:00Z",
  "ntp_synced": true,
  "offset_seconds": 0.0,
  "last_sync": "2025-06-28T10:25:00Z"
}
```

#### POST /api/time/sync

Force une synchronisation NTP pour un serveur.

**Corps de la requête** :
```json
{
  "server_id": "server-1",
  "ntp_server": "pool.ntp.org"
}
```

**Réponse** :
```json
{
  "success": true,
  "offset_seconds": 0.002,
  "message": "NTP sync completed",
  "sync_time": "2025-06-28T10:30:00Z"
}
```

### 4. Simulation NTP (Simulation)

#### POST /api/simulation/set-offset

Configure un décalage temporel pour un serveur (simulation de dérive).

**Corps de la requête** :
```json
{
  "server_id": "server-1",
  "offset_seconds": 5.0
}
```

**Réponse** :
```json
{
  "success": true,
  "server_id": "server-1",
  "offset_seconds": 5.0,
  "message": "Time offset set successfully"
}
```

#### DELETE /api/simulation/remove-offset/{server_id}

Supprime le décalage temporel d'un serveur.

**Réponse** :
```json
{
  "success": true,
  "server_id": "server-1",
  "message": "Time offset removed"
}
```

#### GET /api/simulation/offsets

Récupère tous les décalages temporels configurés.

**Réponse** :
```json
{
  "offsets": {
    "server-1": 0.0,
    "server-2": -5.0,
    "server-3": 2.5
  }
}
```

#### POST /api/simulation/clear-offsets

Supprime tous les décalages temporels configurés.

**Réponse** :
```json
{
  "success": true,
  "message": "All time offsets cleared"
}
```

#### GET /api/simulation/scenarios

Récupère les scénarios de simulation prédéfinis.

**Réponse** :
```json
{
  "scenarios": {
    "minor_drift": {
      "description": "Dérive temporelle mineure",
      "servers": {
        "server-1": 0.0,
        "server-2": -1.0,
        "server-3": 0.5
      }
    },
    "major_drift": {
      "description": "Dérive temporelle majeure",
      "servers": {
        "server-1": 0.0,
        "server-2": -10.0,
        "server-3": 5.0,
        "server-4": -3.0
      }
    },
    "extreme_drift": {
      "description": "Dérive temporelle extrême",
      "servers": {
        "server-1": 0.0,
        "server-2": -30.0,
        "server-3": 15.0,
        "server-4": -8.0,
        "server-5": 12.0
      }
    }
  }
}
```

#### POST /api/simulation/apply-scenario

Applique un scénario de simulation prédéfini.

**Corps de la requête** :
```json
{
  "scenario_name": "major_drift"
}
```

**Réponse** :
```json
{
  "success": true,
  "scenario_name": "major_drift",
  "applied_offsets": {
    "server-1": 0.0,
    "server-2": -10.0,
    "server-3": 5.0,
    "server-4": -3.0
  },
  "message": "Scenario applied successfully"
}
```

## Modèles de Données

### Seat

```json
{
  "id": "integer",
  "row": "string (1 caractère)",
  "number": "integer",
  "is_available": "boolean",
  "reservation": "Reservation | null"
}
```

### Reservation

```json
{
  "id": "integer",
  "seat_id": "integer",
  "customer_name": "string",
  "server_id": "string",
  "created_at": "string (ISO 8601 datetime)"
}
```

### TimeStatus

```json
{
  "server_id": "string",
  "current_time": "string (ISO 8601 datetime)",
  "ntp_synced": "boolean",
  "offset_seconds": "number",
  "last_sync": "string (ISO 8601 datetime) | null"
}
```

### ReservationCreate

```json
{
  "seat_id": "integer",
  "customer_name": "string (min 2, max 100 caractères)",
  "server_id": "string (optionnel, default: 'server-1')"
}
```

### TimeOffsetRequest

```json
{
  "server_id": "string",
  "offset_seconds": "number"
}
```

## Codes d'Erreur

### Codes HTTP Standards

- **200** : Succès
- **201** : Créé avec succès
- **204** : Succès sans contenu
- **400** : Requête invalide
- **404** : Ressource non trouvée
- **409** : Conflit (ex: siège déjà réservé)
- **422** : Données non valides
- **500** : Erreur serveur interne

### Format des Erreurs

```json
{
  "error": {
    "code": "SEAT_ALREADY_RESERVED",
    "message": "Le siège 1 est déjà réservé",
    "details": {
      "seat_id": 1,
      "existing_reservation": {
        "id": 1,
        "customer_name": "Jean Dupont"
      }
    }
  }
}
```

### Codes d'Erreur Métier

| Code | Description |
|------|-------------|
| `SEAT_NOT_FOUND` | Siège introuvable |
| `SEAT_ALREADY_RESERVED` | Siège déjà réservé |
| `RESERVATION_NOT_FOUND` | Réservation introuvable |
| `INVALID_SERVER_ID` | ID de serveur invalide |
| `NTP_SYNC_FAILED` | Échec de synchronisation NTP |
| `TIME_DRIFT_DETECTED` | Dérive temporelle détectée |

## Limites et Quotas

### Rate Limiting

En production, l'API devrait implémenter :
- **100 requêtes/minute** par IP pour les endpoints publics
- **10 réservations/minute** par IP pour éviter le spam
- **Headers** de limite dans les réponses :
  ```
  X-RateLimit-Limit: 100
  X-RateLimit-Remaining: 95
  X-RateLimit-Reset: 1640995200
  ```

### Pagination

Pour les endpoints retournant des listes :
- **Limite par défaut** : 100 éléments
- **Limite maximale** : 1000 éléments
- **Headers** de pagination :
  ```
  X-Total-Count: 150
  X-Page-Count: 2
  ```

## WebSocket (Temps Réel)

### Endpoint WebSocket

**URL** : `ws://localhost:8000/ws/updates`

### Messages entrants

#### Inscription aux mises à jour

```json
{
  "type": "subscribe",
  "topics": ["reservations", "time_sync", "conflicts"]
}
```

#### Désinscription

```json
{
  "type": "unsubscribe", 
  "topics": ["conflicts"]
}
```

### Messages sortants

#### Nouvelle réservation

```json
{
  "type": "reservation_created",
  "data": {
    "id": 1,
    "seat_id": 1,
    "customer_name": "Jean Dupont",
    "server_id": "server-1",
    "created_at": "2025-06-28T10:30:00Z"
  }
}
```

#### Conflit détecté

```json
{
  "type": "conflict_detected",
  "data": {
    "seat_id": 1,
    "reservations": [
      {"id": 1, "customer_name": "Jean Dupont"},
      {"id": 2, "customer_name": "Marie Martin"}
    ]
  }
}
```

#### Synchronisation NTP

```json
{
  "type": "time_sync_update",
  "data": {
    "server_id": "server-1",
    "offset_seconds": 0.002,
    "synced": true
  }
}
```

## Exemples d'Utilisation

### JavaScript/TypeScript

```typescript
// Client API JavaScript
class ReservationAPI {
  constructor(private baseURL: string) {}
  
  async createReservation(data: ReservationCreate): Promise<Reservation> {
    const response = await fetch(`${this.baseURL}/api/reservations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  async getConflicts(): Promise<ConflictResponse> {
    const response = await fetch(`${this.baseURL}/api/reservations/conflicts`);
    return response.json();
  }
}

// Utilisation
const api = new ReservationAPI('http://localhost:8000');

try {
  const reservation = await api.createReservation({
    seat_id: 1,
    customer_name: 'Jean Dupont',
    server_id: 'server-1'
  });
  console.log('Réservation créée:', reservation);
} catch (error) {
  console.error('Erreur:', error);
}
```

### Python

```python
import httpx
import asyncio

class ReservationClient:
    def __init__(self, base_url: str):
        self.base_url = base_url
    
    async def create_reservation(self, seat_id: int, customer_name: str, server_id: str = "server-1"):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/reservations",
                json={
                    "seat_id": seat_id,
                    "customer_name": customer_name,
                    "server_id": server_id
                }
            )
            response.raise_for_status()
            return response.json()
    
    async def simulate_time_drift(self, server_id: str, offset: float):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/api/simulation/set-offset",
                json={
                    "server_id": server_id,
                    "offset_seconds": offset
                }
            )
            response.raise_for_status()
            return response.json()

# Utilisation
async def main():
    client = ReservationClient("http://localhost:8000")
    
    # Configurer une dérive temporelle
    await client.simulate_time_drift("server-2", -5.0)
    
    # Créer une réservation
    reservation = await client.create_reservation(
        seat_id=1,
        customer_name="Jean Dupont",
        server_id="server-2"
    )
    print(f"Réservation créée: {reservation}")

asyncio.run(main())
```

### curl

```bash
# Créer une réservation
curl -X POST http://localhost:8000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "seat_id": 1,
    "customer_name": "Jean Dupont",
    "server_id": "server-1"
  }'

# Configurer un décalage temporel
curl -X POST http://localhost:8000/api/simulation/set-offset \
  -H "Content-Type: application/json" \
  -d '{
    "server_id": "server-2",
    "offset_seconds": -5.0
  }'

# Récupérer les conflits
curl http://localhost:8000/api/reservations/conflicts

# État de synchronisation NTP
curl "http://localhost:8000/api/time/status?server_id=server-1"
```

## Monitoring et Métriques

### Endpoints de Santé

#### GET /health

Vérification basique de santé de l'API.

**Réponse** :
```json
{
  "status": "healthy",
  "timestamp": "2025-06-28T10:30:00Z",
  "version": "1.0.0"
}
```

#### GET /health/detailed

Vérification détaillée incluant les dépendances.

**Réponse** :
```json
{
  "status": "healthy",
  "timestamp": "2025-06-28T10:30:00Z",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "healthy",
      "response_time_ms": 12
    },
    "ntp_sync": {
      "status": "healthy",
      "last_sync": "2025-06-28T10:25:00Z",
      "offset_ms": 2.5
    }
  }
}
```

### Métriques Prometheus

L'API expose des métriques au format Prometheus sur `/metrics` :

```
# HELP reservations_total Total number of reservations
# TYPE reservations_total counter
reservations_total{server_id="server-1"} 25

# HELP reservations_conflicts_total Total number of conflicts detected
# TYPE reservations_conflicts_total counter
reservations_conflicts_total 3

# HELP ntp_offset_seconds Current NTP offset in seconds
# TYPE ntp_offset_seconds gauge
ntp_offset_seconds{server_id="server-1"} 0.002
```

---

*Cette documentation est générée automatiquement à partir du code FastAPI. Consultez `/docs` pour la documentation interactive Swagger.*

# Guide de Simulation NTP - Démonstration des Problématiques Temporelles

## Introduction

Ce guide détaille l'utilisation du système de simulation NTP intégré au projet de réservation de billets. La simulation permet de reproduire et d'étudier les problématiques réelles de synchronisation temporelle dans les systèmes distribués.

## Objectifs de la Simulation

### 1. Démonstration Pédagogique

- **Visualiser l'impact** de la désynchronisation temporelle
- **Comprendre les mécanismes** de résolution de conflits
- **Illustrer l'importance** du protocole NTP en entreprise
- **Sensibiliser** aux bonnes pratiques

### 2. Tests et Validation

- **Tester la robustesse** de l'application face aux dérives temporelles
- **Valider les mécanismes** de détection de conflits
- **Optimiser les algorithmes** de résolution
- **Mesurer l'impact** sur les performances

## Architecture de Simulation

### Composants Impliqués

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Simulation     │    │   Time Service  │    │   Database      │
│   Controller    │◄──►│   (Backend)     │◄──►│   (Timestamps)  │
│  (Frontend)     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └─────────────►│  Python Script  │◄─────────────┘
                        │   (simulation/  │
                        │simulate_time_   │
                        │    drift.py)    │
                        └─────────────────┘
```

### Service de Temps (`time_service.py`)

Le service central gère :

```python
# Stockage des décalages simulés par serveur
time_offsets = {
    "server-1": 0.0,     # Serveur de référence
    "server-2": -5.0,    # 5 secondes de retard
    "server-3": 3.0,     # 3 secondes d'avance
}

def get_current_time(server_id: str = "server-1") -> Tuple[datetime, bool, float]:
    """
    Obtenir le temps actuel avec simulation de dérive
    """
    base_time = datetime.utcnow()
    
    if server_id in time_offsets:
        offset = time_offsets[server_id]
        adjusted_time = base_time + timedelta(seconds=offset)
        return adjusted_time, False, offset  # Non synchronisé
    
    return base_time, True, 0.0  # Synchronisé
```

## Scénarios de Simulation

### 1. Dérive Mineure (Minor Drift)

**Configuration** :
```python
"minor_drift": {
    "server-1": 0.0,    # Référence
    "server-2": -1.0,   # 1 seconde de retard
    "server-3": 0.5     # 0.5 seconde d'avance
}
```

**Impact Attendu** :
- Conflits occasionnels (< 5%)
- Résolution généralement correcte
- Expérience utilisateur acceptable
- Logs d'audit cohérents

**Cas d'Usage** :
- Validation de la robustesse de base
- Test des mécanismes de détection
- Formation aux concepts NTP

### 2. Dérive Majeure (Major Drift)

**Configuration** :
```python
"major_drift": {
    "server-1": 0.0,
    "server-2": -10.0,  # 10 secondes de retard
    "server-3": 5.0,    # 5 secondes d'avance
    "server-4": -3.0    # 3 secondes de retard
}
```

**Impact Attendu** :
- Conflits fréquents (20-30%)
- Problèmes d'ordonnancement visibles
- Dégradation de l'expérience
- Nécessité d'intervention manuelle

**Cas d'Usage** :
- Démonstration de l'impact business
- Test des limites du système
- Validation des alertes

### 3. Dérive Extrême (Extreme Drift)

**Configuration** :
```python
"extreme_drift": {
    "server-1": 0.0,
    "server-2": -30.0,  # 30 secondes de retard
    "server-3": 15.0,   # 15 secondes d'avance
    "server-4": -8.0,   # 8 secondes de retard
    "server-5": 12.0    # 12 secondes d'avance
}
```

**Impact Attendu** :
- Système quasi-inutilisable
- Conflits constants (> 50%)
- Incohérence totale des données
- Perte de confiance utilisateur

**Cas d'Usage** :
- Démonstration de cas catastrophiques
- Test de récupération système
- Justification des investissements NTP

## Utilisation de la Simulation

### Interface Web (Frontend)

#### Panneau de Contrôle

Le composant `SimulationPanel` permet :

```tsx
// Configuration manuelle des décalages
const applyOffset = async (serverId: string, offset: number) => {
  await apiService.setTimeOffset(serverId, offset);
  // Mise à jour de l'interface
};

// Application de scénarios prédéfinis
const applyScenario = async (scenarioName: string) => {
  await apiService.applyScenario(scenarioName);
  // Notification utilisateur
};
```

#### Fonctionnalités Disponibles

1. **Configuration Manuelle** :
   - Sélection du serveur (server-1 à server-5)
   - Saisie du décalage en secondes
   - Application immédiate

2. **Scénarios Prédéfinis** :
   - Boutons pour chaque scénario
   - Application en un clic
   - Réinitialisation rapide

3. **Monitoring Temps Réel** :
   - État de synchronisation par serveur
   - Visualisation des décalages actuels
   - Historique des modifications

### Script Python Autonome

#### Utilisation Basique

```bash
cd simulation/
python simulate_time_drift.py
```

#### Configuration du Script

```python
class NTPSimulator:
    def __init__(self, api_base_url: str = "http://localhost:8000"):
        self.api_base_url = api_base_url
        self.servers = ["server-1", "server-2", "server-3", "server-4", "server-5"]
    
    async def run_simulation(self, scenario: str = "major_drift"):
        """Lance une simulation complète"""
        # 1. Configuration du scénario
        await self.setup_time_drift(scenario)
        
        # 2. Simulation de réservations concurrentes
        for seat_id in range(1, 6):
            await self.simulate_concurrent_reservations(seat_id, 3)
            await asyncio.sleep(2)  # Pause entre les tests
        
        # 3. Analyse des résultats
        await self.analyze_conflicts()
        
        # 4. Nettoyage
        await self.cleanup()
```

#### Fonctionnalités Avancées

```python
async def simulate_realistic_load(self, duration_minutes: int = 10):
    """Simule une charge réaliste sur une période donnée"""
    start_time = time.time()
    end_time = start_time + (duration_minutes * 60)
    
    while time.time() < end_time:
        # Choisir un siège aléatoire
        seat_id = random.randint(1, 50)
        
        # Nombre variable de clients concurrents
        num_clients = random.randint(1, 4)
        
        # Lancer les réservations
        await self.simulate_concurrent_reservations(seat_id, num_clients)
        
        # Pause variable (simulation de charge réelle)
        await asyncio.sleep(random.uniform(0.5, 3.0))
```

### API REST

#### Configuration Manuelle

```bash
# Définir un décalage pour server-2
curl -X POST http://localhost:8000/api/simulation/set-offset \
  -H "Content-Type: application/json" \
  -d '{"server_id": "server-2", "offset_seconds": -5.0}'

# Supprimer le décalage
curl -X DELETE http://localhost:8000/api/simulation/remove-offset/server-2

# Consulter tous les décalages
curl http://localhost:8000/api/simulation/offsets
```

#### Application de Scénarios

```bash
# Appliquer le scénario "major_drift"
curl -X POST http://localhost:8000/api/simulation/apply-scenario \
  -H "Content-Type: application/json" \
  -d '{"scenario_name": "major_drift"}'

# Réinitialiser tous les décalages
curl -X POST http://localhost:8000/api/simulation/clear-offsets
```

## Analyse des Résultats

### Métriques Collectées

#### 1. Taux de Conflits

```sql
-- Requête pour calculer le taux de conflits
SELECT 
    COUNT(DISTINCT seat_id) as total_seats_with_reservations,
    COUNT(DISTINCT CASE WHEN conflict_count > 1 THEN seat_id END) as seats_with_conflicts,
    ROUND(
        (COUNT(DISTINCT CASE WHEN conflict_count > 1 THEN seat_id END) * 100.0) / 
        COUNT(DISTINCT seat_id), 2
    ) as conflict_rate_percent
FROM (
    SELECT seat_id, COUNT(*) as conflict_count
    FROM reservations
    GROUP BY seat_id
) conflicts;
```

#### 2. Distribution Temporelle

```sql
-- Analyse de la distribution des timestamps
SELECT 
    server_id,
    COUNT(*) as reservation_count,
    MIN(created_at) as first_reservation,
    MAX(created_at) as last_reservation,
    AVG(EXTRACT(EPOCH FROM created_at)) as avg_timestamp
FROM reservations
GROUP BY server_id
ORDER BY server_id;
```

#### 3. Délais de Détection

```python
def analyze_conflict_detection_time():
    """Mesure le temps entre conflit et détection"""
    conflicts = get_conflicts_from_api()
    
    for conflict in conflicts:
        reservations = conflict['reservations']
        if len(reservations) >= 2:
            timestamps = [r['created_at'] for r in reservations]
            earliest = min(timestamps)
            latest = max(timestamps)
            detection_delay = latest - earliest
            
            print(f"Seat {conflict['seat_id']}: {detection_delay}s delay")
```

### Visualisations

#### 1. Graphiques Temporels

Le frontend affiche :
- **Timeline des réservations** par serveur
- **Décalages configurés** en temps réel
- **Évolution des conflits** sur la période

#### 2. Heatmap des Conflits

```typescript
// Composant de visualisation des conflits
function ConflictHeatmap({ conflicts }: { conflicts: Conflict[] }) {
  const conflictBySeat = conflicts.reduce((acc, conflict) => {
    acc[conflict.seat_id] = conflict.reservations.length;
    return acc;
  }, {} as Record<number, number>);
  
  return (
    <div className="grid grid-cols-10 gap-1">
      {Array.from({ length: 100 }, (_, i) => (
        <div
          key={i + 1}
          className={`w-8 h-8 rounded ${getColorForConflictCount(conflictBySeat[i + 1] || 0)}`}
          title={`Siège ${i + 1}: ${conflictBySeat[i + 1] || 0} conflits`}
        >
          {i + 1}
        </div>
      ))}
    </div>
  );
}
```

#### 3. Métriques en Temps Réel

```typescript
// Dashboard de monitoring
function SimulationDashboard() {
  const [metrics, setMetrics] = useState({
    totalReservations: 0,
    conflictCount: 0,
    conflictRate: 0,
    avgResponseTime: 0
  });
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const newMetrics = await apiService.getSimulationMetrics();
      setMetrics(newMetrics);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Affichage des métriques...
}
```

## Patterns de Test

### 1. Test de Charge Progressive

```python
async def progressive_load_test():
    """Test avec charge croissante"""
    scenarios = ["minor_drift", "major_drift", "extreme_drift"]
    
    for scenario in scenarios:
        print(f"\n🧪 Testing scenario: {scenario}")
        await simulator.setup_time_drift(scenario)
        
        # Charge progressive : 1, 3, 5 clients concurrents
        for num_clients in [1, 3, 5]:
            print(f"  Testing with {num_clients} concurrent clients")
            conflicts_before = await get_conflict_count()
            
            # Lancer les tests
            for seat_id in range(1, 11):
                await simulator.simulate_concurrent_reservations(seat_id, num_clients)
            
            conflicts_after = await get_conflict_count()
            new_conflicts = conflicts_after - conflicts_before
            print(f"    New conflicts: {new_conflicts}")
```

### 2. Test de Récupération

```python
async def recovery_test():
    """Test de récupération après dérive extrême"""
    # 1. Appliquer une dérive extrême
    await simulator.setup_time_drift("extreme_drift")
    
    # 2. Créer de nombreux conflits
    await create_many_conflicts()
    
    # 3. "Réparer" la synchronisation NTP
    await simulator.clear_all_offsets()
    
    # 4. Tester le comportement post-récupération
    conflicts_before = await get_conflict_count()
    await create_test_reservations()
    conflicts_after = await get_conflict_count()
    
    assert conflicts_after == conflicts_before, "No new conflicts should occur after NTP fix"
```

### 3. Test de Résilience

```python
async def resilience_test():
    """Test de résilience face aux pannes NTP"""
    # Simuler une panne de synchronisation
    await simulate_ntp_outage()
    
    # Le système doit continuer à fonctionner avec dégradation gracieuse
    await test_degraded_mode()
    
    # Récupération de la synchronisation
    await restore_ntp_sync()
    
    # Vérifier le retour à la normale
    await test_normal_mode()
```

## Bonnes Pratiques de Simulation

### 1. Préparation

```python
# Toujours nettoyer avant une simulation
async def prepare_simulation():
    """Prépare l'environnement pour une nouvelle simulation"""
    # Nettoyer les décalages existants
    await simulator.clear_all_offsets()
    
    # Purger les anciennes réservations
    await clear_test_reservations()
    
    # Réinitialiser les métriques
    await reset_metrics()
    
    # Vérifier l'état initial
    assert await get_conflict_count() == 0
```

### 2. Isolation des Tests

```python
# Utiliser des identifiants uniques pour chaque test
def generate_test_customer_name():
    """Génère un nom de client unique pour les tests"""
    timestamp = int(time.time() * 1000)
    return f"TestCustomer_{timestamp}_{random.randint(1000, 9999)}"
```

### 3. Documentation des Tests

```python
async def documented_simulation_run():
    """Simulation documentée avec logs détaillés"""
    logger.info("🚀 Starting NTP simulation")
    logger.info(f"📊 Initial state: {await get_system_state()}")
    
    scenario = "major_drift"
    logger.info(f"🎭 Applying scenario: {scenario}")
    await simulator.setup_time_drift(scenario)
    
    for i in range(10):
        logger.info(f"🎫 Round {i+1}: Testing concurrent reservations")
        seat_id = i + 1
        conflicts_before = await get_conflict_count()
        
        await simulator.simulate_concurrent_reservations(seat_id, 3)
        
        conflicts_after = await get_conflict_count()
        new_conflicts = conflicts_after - conflicts_before
        
        if new_conflicts > 0:
            logger.warning(f"⚠️  Conflict detected on seat {seat_id}: {new_conflicts} conflicts")
        else:
            logger.info(f"✅ No conflicts on seat {seat_id}")
    
    logger.info(f"📈 Final state: {await get_system_state()}")
    logger.info("🏁 Simulation completed")
```

## Troubleshooting

### Problèmes Courants

#### 1. Simulation Ne Fonctionne Pas

```bash
# Vérifier que l'API est accessible
curl http://localhost:8000/health

# Vérifier les logs backend
docker compose logs backend

# Tester un décalage simple
curl -X POST http://localhost:8000/api/simulation/set-offset \
  -H "Content-Type: application/json" \
  -d '{"server_id": "server-1", "offset_seconds": 1.0}'
```

#### 2. Conflits Non Détectés

```python
# Vérifier la configuration des décalages
offsets = await get_current_offsets()
print(f"Current offsets: {offsets}")

# Vérifier les contraintes de base de données
# La contrainte d'unicité doit être active sur (seat_id)
```

#### 3. Performance Dégradée

```python
# Réduire la charge de simulation
num_concurrent_reservations = 2  # Au lieu de 5
delay_between_tests = 1.0        # Au lieu de 0.1

# Nettoyer régulièrement
await cleanup_old_reservations()
```

### Debugging

```python
# Mode debug avec logs détaillés
import logging
logging.basicConfig(level=logging.DEBUG)

# Traçage des appels API
async def debug_api_call(method, url, data=None):
    logger.debug(f"🌐 {method} {url}")
    if data:
        logger.debug(f"📤 Request: {data}")
    
    response = await make_api_call(method, url, data)
    
    logger.debug(f"📥 Response: {response.status_code}")
    logger.debug(f"📋 Body: {response.json()}")
    
    return response
```

---

*Cette simulation constitue un outil pédagogique puissant pour comprendre les enjeux de la synchronisation temporelle. Utilisez-la pour explorer différents scénarios et sensibiliser aux bonnes pratiques NTP.*

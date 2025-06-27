# Documentation du Projet - Index

Bienvenue dans la documentation du **Système de Réservation de Billets - Démonstration NTP**.

Ce projet illustre l'importance critique de la synchronisation temporelle dans les architectures logicielles d'entreprise à travers un cas concret de système de réservation distribué.

## 📚 Documents Disponibles

### 📖 [Rapport Complet : Le Protocole NTP dans une Architecture Logicielle d'Entreprise](./rapport-ntp-architecture-entreprise.md)

**Document principal** - Analyse complète du protocole NTP et de sa mise en place dans les architectures d'entreprise.

**Contenu** :
- Fondamentaux du protocole NTP
- Importance de la synchronisation temporelle
- Architecture du projet de démonstration
- Mise en œuvre dans les microservices
- Analyse des problématiques métier
- Avantages et inconvénients
- Bonnes pratiques et recommandations
- Conclusion et perspectives

---

### 🛠️ [Guide de Développement](./development.md)

**Guide technique** pour les développeurs souhaitant contribuer au projet ou comprendre son architecture.

**Contenu** :
- Architecture détaillée du projet
- Installation et configuration
- Structure du code (Backend FastAPI, Frontend Next.js)
- Services NTP implémentés
- Tests et débogage
- Contribution et standards de code
- Déploiement

---

### 🔌 [Documentation API](./api.md)

**Référence complète** de l'API REST du système de réservation.

**Contenu** :
- Endpoints de gestion des sièges
- API de réservations avec gestion des conflits
- Services de synchronisation temporelle
- Simulation NTP et configuration des décalages
- Modèles de données et codes d'erreur
- Exemples d'utilisation (JavaScript, Python, curl)
- WebSocket pour les mises à jour temps réel
- Monitoring et métriques

---

### ⏰ [Guide de Simulation NTP](./ntp-simulation.md)

**Guide pratique** pour utiliser le système de simulation et comprendre les problématiques temporelles.

**Contenu** :
- Objectifs et architecture de simulation
- Scénarios prédéfinis (dérive mineure, majeure, extrême)
- Utilisation de l'interface web et du script Python
- Analyse des résultats et métriques
- Patterns de test et bonnes pratiques
- Troubleshooting et debugging

---

## 🎯 Objectifs du Projet

### 1. **Démonstration Pédagogique**
- Illustrer concrètement l'impact de la désynchronisation temporelle
- Sensibiliser aux enjeux du protocole NTP en entreprise
- Fournir un cas d'étude réaliste et reproductible

### 2. **Validation Technique**
- Tester la robustesse des applications face aux dérives temporelles
- Valider les mécanismes de détection et résolution de conflits
- Mesurer l'impact sur les performances et l'expérience utilisateur

### 3. **Formation et Sensibilisation**
- Former les équipes aux bonnes pratiques de synchronisation
- Démontrer le retour sur investissement des solutions NTP
- Créer une référence pour les architectures futures

## 🏗️ Architecture Globale

```
Frontend (Next.js)     Backend (FastAPI)      Database (PostgreSQL)
     │                       │                        │
     ├─ Interface utilisateur ├─ API REST             ├─ Réservations
     ├─ Panneau simulation   ├─ Service NTP          ├─ Logs temporels
     ├─ Monitoring temps réel├─ Gestion conflits     ├─ Contraintes unicité
     └─ Visualisation        └─ Simulation dérive    └─ Historique
              │                       │                        │
              └───────────────────────┼────────────────────────┘
                                      │
                              Scripts de Simulation
                              (Python + asyncio)
```

## 🚀 Quick Start

### Installation Rapide

```bash
# Clone du projet
git clone <repository-url>
cd projet/

# Installation complète
make setup

# Lancement en mode développement
make dev
```

### Accès aux Services

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **Documentation API** : http://localhost:8000/docs
- **Base de données** : localhost:5432

### Première Simulation

1. **Accéder à l'interface** : http://localhost:3000
2. **Configurer un scénario** : Panneau "Simulation NTP" → "Major Drift"
3. **Tester des réservations** : Sélectionner un siège et réserver
4. **Observer les conflits** : Surveiller la liste des conflits détectés

## 📊 Cas d'Usage Démontrés

### 1. **Réservations Concurrentes**
- Plusieurs utilisateurs réservent le même siège simultanément
- Serveurs avec décalages temporels différents
- Détection et analyse des conflits résultants

### 2. **Impact de la Dérive Temporelle**
- Scénarios de dérive croissante (1s → 30s)
- Mesure de l'impact sur le taux de conflits
- Corrélation entre dérive et dégradation de service

### 3. **Récupération Post-Synchronisation**
- Simulation de "réparation" NTP
- Retour à un fonctionnement normal
- Analyse de la résilience du système

## 🎓 Utilisation Pédagogique

### Pour les Enseignants

- **Cours d'architecture** : Illustration des systèmes distribués
- **Cours de réseaux** : Protocoles de synchronisation
- **Cours de bases de données** : Gestion des transactions distribuées
- **Projets étudiants** : Base pour des extensions (sécurité, performance, etc.)

### Pour les Entreprises

- **Formation technique** : Sensibilisation des équipes
- **Audits d'architecture** : Identification des risques temporels
- **Proof of Concept** : Validation avant déploiement NTP
- **Documentation** : Standards et bonnes pratiques internes

## 🔧 Technologies Utilisées

### Backend
- **FastAPI** : Framework web moderne et performant
- **SQLAlchemy** : ORM pour PostgreSQL
- **Pydantic** : Validation et sérialisation des données
- **ntplib** : Client NTP natif Python
- **asyncio** : Programmation asynchrone

### Frontend
- **Next.js 13+** : Framework React avec App Router
- **TypeScript** : Typage statique
- **Tailwind CSS** : Framework CSS utilitaire
- **React Hooks** : Gestion d'état moderne

### Infrastructure
- **Docker** : Conteneurisation des services
- **PostgreSQL** : Base de données relationnelle
- **Docker Compose** : Orchestration multi-services

## 🤝 Contribution

Ce projet est conçu pour être **éducatif** et **évolutif**. Les contributions sont les bienvenues :

### Types de Contributions

- **Améliorations pédagogiques** : Nouveaux scénarios, visualisations
- **Extensions techniques** : Nouvelles métriques, protocoles (PTP, etc.)
- **Documentation** : Traductions, guides spécialisés
- **Tests** : Nouveaux cas de test, benchmarks

### Process de Contribution

1. **Fork** du repository
2. **Branche** dédiée à la fonctionnalité
3. **Développement** avec tests
4. **Documentation** mise à jour
5. **Pull Request** avec description détaillée

Voir le [Guide de Développement](./development.md) pour les détails techniques.

## 📞 Support et Contact

### Documentation

- **GitHub Issues** : Signalement de bugs et demandes de fonctionnalités
- **GitHub Discussions** : Questions générales et propositions
- **Wiki** : Documentation collaborative

### Ressources Externes

- **RFC 5905** : Spécification NTP version 4
- **Pool NTP** : https://www.pool.ntp.org/
- **Documentation FastAPI** : https://fastapi.tiangolo.com/
- **Documentation Next.js** : https://nextjs.org/docs

---

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour les détails.

---

**Dernière mise à jour** : 28 juin 2025  
**Version** : 1.0.0  
**Auteur** : Projet pédagogique Architecture d'Entreprise

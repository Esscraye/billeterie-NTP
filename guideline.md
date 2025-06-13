# Système de Réservation de Billets

## Scénario
Imaginez un système de réservation de billets pour un concert. Plusieurs serveurs gèrent les réservations, et chaque serveur doit être synchronisé pour éviter que deux personnes ne réservent le même siège au même moment.

## Problème sans Correction NTP
Si les serveurs ne sont pas synchronisés, les horodatages des réservations peuvent être incorrects, ce qui peut entraîner des doubles réservations. Par exemple :
- Le serveur A pense qu'il est 12:00:00 et enregistre une réservation pour le siège 1.
- Le serveur B, qui est en retard de 5 secondes, pense qu'il est 11:59:55 et enregistre une autre réservation pour le même siège 1.
- Résultat : deux personnes ont réservé le même siège, ce qui cause un conflit.

## Solution avec Correction NTP
Avec la correction NTP, tous les serveurs sont synchronisés et utilisent le même temps de référence. Ainsi, les horodatages des réservations sont cohérents, et les doubles réservations sont évitées.

## Plan de Projet

### 1. Définir les Objectifs du Projet
- **Objectif Principal :** Illustrer l'importance de la synchronisation NTP dans un système de réservation de billets.
- **Objectifs Secondaires :**
  - Montrer les différences de comportement avec et sans correction NTP.
  - Créer une application démonstrative qui peut être déployée sur un VPS.

### 2. Architecture Technique
- **Backend :** FastAPI
- **Base de Données :** PostgreSQL
- **Conteneurisation :** Docker
- **Déploiement :** VPS

### 3. Planification des Fonctionnalités
- **Endpoints :**
  - `/reserve_ticket` : Réserver un billet avec un horodatage.
  - `/get_reservations` : Récupérer les réservations enregistrées.
  - `/compare_reservations` : Comparer les horodatages des réservations avant et après correction NTP.
- **Visualisation :**
  - Afficher les différences de temps entre les serveurs et les conflits de réservation.

### 4. Simulation des Problèmes de Synchronisation
- **Simulation des Décalages Horaires :**
  - Modifier manuellement l'heure sur certains serveurs pour simuler des décalages.
  - Observer les incohérences dans les horodatages des réservations.
- **Correction NTP :**
  - Configurer NTP sur le VPS.
  - Observer comment la correction NTP résout les incohérences et évite les doubles réservations.

### 5. Déploiement et Tests
- **Configuration du VPS :**
  - Installer Docker et Docker Compose.
  - Configurer PostgreSQL et FastAPI dans des conteneurs Docker.
- **Tests :**
  - Enregistrer des réservations avec et sans correction NTP.
  - Documenter les résultats et les observations.

### 6. Détails Techniques
- **Configuration Docker :**
  - Créer un fichier `docker-compose.yml` pour définir les services FastAPI et PostgreSQL.
  - Exemple de configuration Docker :
    ```yaml
    version: '3'
    services:
      web:
        build: .
        ports:
          - "8000:8000"
        depends_on:
          - db
      db:
        image: postgres
        environment:
          POSTGRES_PASSWORD: example
        ports:
          - "5432:5432"
    ```
- **Scripts pour Simuler des Décalages Horaires :**
  - Créer des scripts pour modifier l'heure système sur les serveurs.
  - Exemple de script bash pour modifier l'heure :
    ```bash
    sudo date -s "2023-10-01 12:00:00"
    ```
- **Configuration NTP :**
  - Installer et configurer NTP sur le VPS.
  - Exemple de configuration NTP :
    ```bash
    sudo apt-get install ntp
    sudo systemctl start ntp
    sudo systemctl enable ntp
    ```

### 7. Plan de Développement
1. **Étape 1 : Configuration Initiale de l'Environnement**
   - Installer Docker et Docker Compose sur le VPS.
   - Créer les fichiers de configuration Docker pour FastAPI et PostgreSQL.

2. **Étape 2 : Développement des Endpoints**
   - Développer les endpoints `/reserve_ticket`, `/get_reservations`, et `/compare_reservations` dans FastAPI.
   - Configurer la connexion à la base de données PostgreSQL.

3. **Étape 3 : Implémentation de la Simulation des Décalages Horaires**
   - Créer des scripts pour modifier l'heure système sur les serveurs.
   - Implémenter la logique pour enregistrer et comparer les horodatages des réservations.

4. **Étape 4 : Déploiement sur le VPS et Configuration NTP**
   - Déployer l'application et la base de données sur le VPS.
   - Configurer NTP sur le VPS pour synchroniser l'heure.

5. **Étape 5 : Tests et Documentation des Résultats**
   - Enregistrer des réservations avec et sans correction NTP.
   - Documenter les résultats et les observations.

Ce plan vous guidera à travers les étapes nécessaires pour créer et déployer votre application FastAPI avec une base de données PostgreSQL dockerisée, et pour illustrer l'importance de la synchronisation NTP dans un système de réservation de billets.
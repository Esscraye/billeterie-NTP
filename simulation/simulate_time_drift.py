#!/usr/bin/env python3
"""
Script de simulation de dérive temporelle pour démonstration NTP
"""

import asyncio
import aiohttp
import random
import time
from datetime import datetime
from typing import List, Dict

class NTPSimulator:
    def __init__(self, api_base_url: str = "http://localhost:8000"):
        self.api_base_url = api_base_url
        self.servers = ["server-1", "server-2", "server-3", "server-4", "server-5"]
        
    async def setup_time_drift(self, scenario: str = "major_drift"):
        """Configure un scénario de dérive temporelle"""
        scenarios = {
            "minor_drift": {
                "server-1": 0.0,
                "server-2": -1.0,
                "server-3": 0.5
            },
            "major_drift": {
                "server-1": 0.0,
                "server-2": -10.0,
                "server-3": 5.0,
                "server-4": -3.0
            },
            "extreme_drift": {
                "server-1": 0.0,
                "server-2": -30.0,
                "server-3": 15.0,
                "server-4": -8.0,
                "server-5": 12.0
            }
        }
        
        if scenario not in scenarios:
            print(f"Scénario '{scenario}' non trouvé. Utilisation de 'major_drift'")
            scenario = "major_drift"
        
        async with aiohttp.ClientSession() as session:
            print(f"🕐 Configuration du scénario: {scenario}")
            
            for server_id, offset in scenarios[scenario].items():
                try:
                    async with session.post(
                        f"{self.api_base_url}/api/simulation/set-offset",
                        json={"server_id": server_id, "offset_seconds": offset}
                    ) as response:
                        if response.status == 200:
                            print(f"  ✅ {server_id}: {offset:+.1f}s")
                        else:
                            print(f"  ❌ Erreur pour {server_id}: {response.status}")
                except Exception as e:
                    print(f"  ❌ Erreur pour {server_id}: {e}")
    
    async def simulate_concurrent_reservations(self, seat_id: int, num_reservations: int = 3):
        """Simule des réservations concurrentes sur le même siège"""
        print(f"\n🎫 Simulation de {num_reservations} réservations concurrentes sur le siège {seat_id}")
        
        # Préparer les réservations
        reservations = []
        for i in range(num_reservations):
            server_id = random.choice(self.servers[:num_reservations])
            customer_name = f"Client_{i+1}_{int(time.time())}"
            reservations.append((server_id, customer_name))
        
        async with aiohttp.ClientSession() as session:
            # Lancer toutes les réservations en parallèle
            tasks = []
            for server_id, customer_name in reservations:
                task = self.make_reservation(session, seat_id, customer_name, server_id)
                tasks.append(task)
            
            # Attendre toutes les réservations
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Analyser les résultats
            successes = []
            failures = []
            
            for i, result in enumerate(results):
                server_id, customer_name = reservations[i]
                if isinstance(result, Exception):
                    failures.append((server_id, customer_name, str(result)))
                    print(f"  ❌ {server_id} ({customer_name}): {result}")
                else:
                    successes.append((server_id, customer_name, result))
                    print(f"  ✅ {server_id} ({customer_name}): Réservation OK")
            
            print(f"\n📊 Résultats: {len(successes)} succès, {len(failures)} échecs")
            
            if len(successes) > 1:
                print("⚠️  CONFLIT DÉTECTÉ: Plusieurs réservations réussies pour le même siège!")
            
        # Attendre un peu avant de vérifier les conflits
        await asyncio.sleep(2)
        await self.check_conflicts()
    
    async def make_reservation(self, session: aiohttp.ClientSession, seat_id: int, customer_name: str, server_id: str):
        """Effectue une réservation via l'API"""
        try:
            async with session.post(
                f"{self.api_base_url}/api/reservations/reserve",
                params={"server_id": server_id},
                json={"seat_id": seat_id, "customer_name": customer_name}
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    error_text = await response.text()
                    raise Exception(f"HTTP {response.status}: {error_text}")
        except Exception as e:
            raise Exception(f"Erreur de réservation: {e}")
    
    async def check_conflicts(self):
        """Vérifie et affiche les conflits détectés"""
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(f"{self.api_base_url}/api/reservations/conflicts") as response:
                    if response.status == 200:
                        conflicts = await response.json()
                        
                        if not conflicts:
                            print("✅ Aucun conflit détecté")
                            return
                        
                        print(f"\n⚠️  {len(conflicts)} conflit(s) détecté(s):")
                        for conflict in conflicts:
                            print(f"  - Siège {conflict['seat_id']}: "
                                  f"écart de {conflict['time_difference_seconds']:.2f}s "
                                  f"({conflict['detected_at']})")
                    else:
                        print(f"❌ Erreur lors de la vérification des conflits: {response.status}")
            except Exception as e:
                print(f"❌ Erreur: {e}")
    
    async def reset_simulation(self):
        """Remet à zéro la simulation"""
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(f"{self.api_base_url}/api/simulation/stop-simulation") as response:
                    if response.status == 200:
                        print("🔄 Simulation arrêtée - Tous les serveurs synchronisés")
                    else:
                        print(f"❌ Erreur lors de l'arrêt: {response.status}")
            except Exception as e:
                print(f"❌ Erreur: {e}")
    
    async def initialize_seats(self, total_seats: int = 100):
        """Initialise les sièges"""
        async with aiohttp.ClientSession() as session:
            try:
                async with session.post(f"{self.api_base_url}/api/seats/initialize", 
                                       json={"total_seats": total_seats}) as response:
                    if response.status == 200:
                        print(f"🪑 {total_seats} sièges initialisés")
                    else:
                        print(f"❌ Erreur lors de l'initialisation: {response.status}")
            except Exception as e:
                print(f"❌ Erreur: {e}")

async def run_full_demo():
    """Lance une démonstration complète"""
    simulator = NTPSimulator()
    
    print("🎭 === DÉMONSTRATION NTP - SYSTÈME DE RÉSERVATION ===\n")
    
    # 1. Initialiser les sièges
    print("1️⃣ Initialisation des sièges...")
    await simulator.initialize_seats(100)
    
    # 2. Test avec synchronisation NTP (pas de conflits attendus)
    print("\n2️⃣ Test avec synchronisation NTP...")
    await simulator.reset_simulation()
    await asyncio.sleep(1)
    
    print("Réservations avec serveurs synchronisés:")
    await simulator.simulate_concurrent_reservations(seat_id=1, num_reservations=2)
    
    # 3. Configuration de la dérive temporelle
    print("\n3️⃣ Configuration de la dérive temporelle...")
    await simulator.setup_time_drift("major_drift")
    await asyncio.sleep(1)
    
    # 4. Test avec dérive temporelle (conflits attendus)
    print("\n4️⃣ Test avec dérive temporelle...")
    print("Réservations avec serveurs désynchronisés:")
    await simulator.simulate_concurrent_reservations(seat_id=2, num_reservations=3)
    
    # 5. Test avec dérive extrême
    print("\n5️⃣ Test avec dérive extrême...")
    await simulator.setup_time_drift("extreme_drift")
    await asyncio.sleep(1)
    
    print("Réservations avec dérive extrême:")
    await simulator.simulate_concurrent_reservations(seat_id=3, num_reservations=4)
    
    # 6. Résumé final
    print("\n6️⃣ Résumé final des conflits...")
    await simulator.check_conflicts()
    
    print("\n🎉 Démonstration terminée!")
    print("💡 Conclusion: La synchronisation NTP est essentielle pour éviter les conflits")
    print("   dans les systèmes distribués critiques comme les réservations.")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Simulateur de dérive temporelle NTP")
    parser.add_argument("--scenario", choices=["minor_drift", "major_drift", "extreme_drift"],
                        default="major_drift", help="Scénario de dérive à utiliser")
    parser.add_argument("--seat", type=int, default=1, help="Numéro du siège à tester")
    parser.add_argument("--reservations", type=int, default=3, help="Nombre de réservations concurrentes")
    parser.add_argument("--full-demo", action="store_true", help="Lancer la démonstration complète")
    parser.add_argument("--reset", action="store_true", help="Arrêter toutes les simulations")
    
    args = parser.parse_args()
    
    simulator = NTPSimulator()
    
    if args.full_demo:
        asyncio.run(run_full_demo())
    elif args.reset:
        asyncio.run(simulator.reset_simulation())
    else:
        async def run_custom():
            await simulator.setup_time_drift(args.scenario)
            await asyncio.sleep(1)
            await simulator.simulate_concurrent_reservations(args.seat, args.reservations)
        
        asyncio.run(run_custom())

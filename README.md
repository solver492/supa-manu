# Mon Auxiliaire Déménagement

## 🎯 Vue d'ensemble

"Mon Auxiliaire Déménagement" est une application web de gestion complète destinée aux entreprises de déménagement. Elle permet de gérer l'ensemble des opérations quotidiennes, de la planification des prestations à la facturation, en passant par la gestion des clients, des employés et des véhicules.

## 🔧 Aspects Techniques

### Architecture
*   **Frontend**: React 18.2.0 avec Vite comme outil de build.
*   **Navigation**: React Router 6.16.0.
*   **Styling**: TailwindCSS 3.3.2.
*   **Composants UI**: shadcn/ui (construit sur Radix UI).
*   **Icônes**: Lucide React 0.292.0.
*   **Animations**: Framer Motion 10.16.4.
*   **Langage**: JavaScript (fichiers .jsx pour les composants React).
*   **Stockage de données (Prototype)**: localStorage. Supabase est recommandé pour la production.

### Organisation des Dossiers (simplifiée pour le frontend actuel)
```
mon-auxiliaire-demenagement/
├── public/
│   └── ... (fichiers statiques)
├── src/
│   ├── assets/
│   │   └── ... (images, polices, etc.)
│   ├── components/
│   │   ├── ui/ # Composants shadcn/ui de base
│   │   ├── auth/ # Composants liés à l'authentification
│   │   ├── calendar/ # Composants spécifiques au calendrier
│   │   ├── clients/ # Composants pour la gestion des clients
│   │   ├── dashboard/ # Composants pour le tableau de bord
│   │   ├── employees/ # Composants pour la gestion des employés
│   │   ├── services/ # Composants pour la gestion des prestations
│   │   ├── vehicles/ # Composants pour la gestion des véhicules
│   │   ├── Header.jsx
│   │   ├── Layout.jsx
│   │   └── Sidebar.jsx
│   ├── config/
│   │   └── navConfig.jsx # Configuration de la navigation
│   ├── contexts/
│   │   └── AuthContext.jsx # Contexte d'authentification
│   │   └── ThemeContext.jsx # Contexte pour le thème
│   ├──hooks/
│   │   └── useAuth.js # Hook pour l'authentification
│   │   └── useTheme.js # Hook pour le thème
│   ├── lib/
│   │   └── utils.js # Fonctions utilitaires (ex: cn)
│   ├── pages/ # Composants de page pour chaque route principale
│   │   ├── Auth/
│   │   │   └── LoginPage.jsx
│   │   ├── AppSettingsPage.jsx
│   │   ├── CalendarPage.jsx
│   │   ├── ClientSitesPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── EmployeesPage.jsx
│   │   ├── InvoicingPage.jsx
│   │   ├── ReportsPage.jsx
│   │   ├── ServicesPage.jsx
│   │   ├── UserProfilePage.jsx
│   │   └── VehiclesPage.jsx
│   ├── App.jsx # Composant principal de l'application avec gestion des routes
│   ├── index.css # Styles globaux TailwindCSS
│   └── main.jsx # Point d'entrée de l'application React
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── README.md # Ce fichier
└── tailwind.config.js
```

## 📊 Modules Principaux et Fonctionnement

L'application est structurée autour de plusieurs modules clés, accessibles via une barre de navigation latérale après authentification.

### 0. Authentification
*   **Page de Connexion**: Interface soignée et animée pour la saisie des identifiants.
*   **Accès Super-Admin**: Identifiants cachés (`genesis` / `babayaga369`) pour un accès privilégié (actuellement simulé).
*   **Protection des Routes**: Les modules ne sont accessibles qu'après une connexion réussie.
*   **Gestion de Session (simulée)**: Utilisation de `localStorage` pour maintenir l'état de connexion.

### 1. Dashboard (Tableau de Bord)
*   **Vue d'Ensemble**: Affiche les Indicateurs de Performance Clés (KPIs) en un coup d'œil.
    *   Chiffre d'affaires (simulé).
    *   Nombre de nouveaux clients.
    *   Prestations planifiées pour la semaine.
*   **Planning du Jour**: Liste les prestations prévues pour la journée en cours, synchronisée avec le module Calendrier.
*   **Alertes et Notifications Importantes**: Met en évidence les actions urgentes ou les informations critiques (ex: maintenance de véhicule, factures en retard).
*   **Mode Démo/Réel**: Un interrupteur permet de basculer entre des données de démonstration et des données (simulées) réelles pour les statistiques.

### 2. Gestion des Sites Clients
*   **Liste des Clients**: Affichage tabulaire avec recherche et filtres.
*   **Création/Modification**: Formulaires modaux pour ajouter ou éditer les informations d'un client (nom, adresse, contact, téléphone, email).
*   **Suppression**: Possibilité de supprimer un client avec confirmation.
*   **Synchronisation**: Les clients créés ici sont disponibles pour la sélection lors de la création de prestations.

### 3. Gestion des Prestations
*   **Planification**: Création de nouvelles prestations avec sélection du client, type de service, date/heure, statut.
*   **Affectation des Ressources**:
    *   Assignation d'un chef d'équipe.
    *   Sélection d'un véhicule parmi ceux disponibles.
    *   Spécification du nombre de manutentionnaires requis pour la prestation.
*   **Suivi des Statuts**: Mise à jour du statut d'une prestation (Planifié, En cours, Terminé, Annulé).
*   **Notes et Instructions**: Ajout de détails spécifiques pour chaque prestation.
*   **Impression**: Génération d'une fiche de prestation imprimable.
*   **Synchronisation Calendrier**: Les prestations créées sont automatiquement ajoutées au module Calendrier.

### 4. Gestion des Employés
*   **Base de Données du Personnel**: Liste des employés avec leurs informations (nom, poste, avatar, compétences, disponibilité, salaire).
*   **Gestion des Rôles**: Attribution de postes (Chef d'équipe, Déménageur, etc.).
*   **Chef d'Équipe**:
    *   Configuration spécifique pour les chefs d'équipe : nom de leur équipe et nombre de manutentionnaires la composant.
*   **Coordonnées**: Ajout du numéro de téléphone avec un lien direct pour contacter via WhatsApp.
*   **Disponibilités**: Suivi de la disponibilité de chaque employé.

### 5. Gestion des Véhicules
*   **Suivi de la Flotte**: Liste des véhicules avec immatriculation, type, état, capacité.
*   **État des Véhicules**: Gestion de la disponibilité (Disponible, En mission, En maintenance).
*   **Maintenance**: Suivi des dates de prochaine maintenance.
*   **Synchronisation**: Les véhicules enregistrés ici sont disponibles pour l'affectation aux prestations.

### 6. Facturation
*   **Liste des Factures**: Visualisation des factures avec leur statut (Payée, En attente, En retard).
*   **Génération (simulée)**: Création de factures liées à des clients et prestations.
*   **Calculs Automatiques (simulés)**: Montant HT, TVA, Montant TTC.
*   **Suivi des Paiements**: Mise à jour du statut de paiement d'une facture.
*   **Export PDF (simulé)**: Bouton pour un futur export en PDF.

### 7. Calendrier
*   **Vue Globale**: Affichage mensuel des événements.
*   **Synchronisation des Prestations**: Les prestations créées dans le module "Gestion des Prestations" sont automatiquement affichées comme événements dans le calendrier.
*   **Gestion d'Événements Divers**: Possibilité d'ajouter d'autres types d'événements (Maintenance, Interne, Rappel) avec des codes couleurs distincts.
*   **Navigation Facile**: Passage d'un mois à l'autre.
*   **Détail Journalier**: Visualisation des événements pour une date sélectionnée.
*   **Impression du Calendrier**: Fonctionnalité pour imprimer la vue actuelle du calendrier avec un formatage de base.

### 8. Rapports et Statistiques
*   **Analyses Prédéfinies (simulées)**:
    *   Chiffre d'affaires.
    *   Performance des équipes.
    *   Taux d'occupation des véhicules.
    *   Satisfaction client.
*   **Filtres Temporels**: Sélection de la période pour les rapports (ex: 7 derniers jours, mois en cours).
*   **Génération de Rapports Personnalisés (simulée)**: Interface pour sélectionner le type de rapport, les données à inclure et le format d'export.

## ✨ Fonctionnalités Transversales

### Interface Utilisateur (UI)
*   **Design Moderne et Réactif**: Interface soignée, colorée avec des dégradés et des animations subtiles. S'adapte aux différentes tailles d'écran.
*   **Navigation Intuitive**: Barre latérale pour un accès rapide aux modules.
*   **Notifications Toast**: Feedback utilisateur pour les actions (succès, erreur).
*   **Thème Personnalisable**: Possibilité de choisir entre un thème clair, sombre ou suivre les préférences du système (via la page Paramètres).

### Profil Utilisateur
*   **Gestion des Informations Personnelles**: Modification du nom, email, téléphone.
*   **Changement de Photo de Profil (simulé)**: Possibilité de mettre à jour l'avatar.
*   **Changement de Mot de Passe (simulé)**.

### Paramètres de l'Application
*   **Notifications**: Configuration des préférences de notification (email, in-app - simulé).
*   **Apparence**: Sélection du thème (clair/sombre/système) et de la langue (simulé).
*   **Sécurité (simulée)**: Options pour l'authentification à deux facteurs, historique d'activité.

## 💡 Points Forts
*   **Interface Utilisateur Soignée**: Utilisation de TailwindCSS et shadcn/ui pour un design moderne et professionnel avec une bonne expérience utilisateur.
*   **Centralisation des Données**: Gestion de multiples aspects de l'activité de déménagement en un seul lieu.
*   **Interactivité**: Nombreuses fonctionnalités CRUD (Créer, Lire, Mettre à jour, Supprimer) simulées avec retours visuels.
*   **Modularité**: Structure claire avec des composants réutilisables et des pages dédiées à chaque fonctionnalité.
*   **Préparation pour Backend**: Bien que le backend ne soit pas implémenté, la structure des données et les interactions sont conçues pour faciliter une future intégration (par exemple avec Supabase).
*   **Expérience Développeur**: Utilisation de Vite pour un développement rapide, organisation claire des fichiers.

## 🚀 Améliorations Possibles
*   **Intégration Backend Réelle**: Remplacer `localStorage` par une véritable base de données (PostgreSQL via Supabase est recommandé) pour la persistance des données, l'authentification sécurisée et la gestion des utilisateurs.
*   **Fonctionnalités de Rapports Avancées**: Implémenter une génération de graphiques dynamiques (ex: avec Chart.js ou Recharts) et des exports de données réels.
*   **Optimisation des Performances**: Pour des volumes de données plus importants, mettre en place la pagination côté serveur, le "lazy loading" de composants.
*   **Tests Automatisés**: Ajouter des tests unitaires et d'intégration pour assurer la robustesse de l'application.
*   **Gestion des Droits et Rôles Affinée**: Implémenter un système de permissions plus granulaire si différents types d'utilisateurs (admin, employé, etc.) doivent avoir des accès restreints.
*   **Internationalisation Complète**: Actuellement, l'interface est en français. Une solution i18n permettrait de supporter plusieurs langues de manière dynamique.
*   **Notifications en Temps Réel**: Utiliser des WebSockets ou des services comme Supabase Realtime pour des notifications instantanées.
*   **Export PDF Réel**: Intégrer une bibliothèque comme `jsPDF` ou une solution côté serveur pour la génération de documents PDF (factures, fiches de prestation).
*   **Intégration Email**: Connecter l'application à un service d'envoi d'emails pour les notifications, confirmations, etc.
*   **Validation des Données Poussée**: Renforcer la validation des formulaires côté client et prévoir une validation côté serveur.

## Démarrage de l'application (localement)
1.  Cloner le dépôt.
2.  Installer les dépendances : `npm install`
3.  Lancer le serveur de développement : `npm run dev`
4.  Ouvrir l'application dans le navigateur à l'adresse indiquée (généralement `http://localhost:5173`).

Ce README fournit un aperçu complet de l'application "Mon Auxiliaire Déménagement" dans son état actuel de développement frontend.

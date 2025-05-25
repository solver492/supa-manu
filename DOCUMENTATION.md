# Documentation de l'Application "Mon Auxiliaire Déménagement"

## 1. Vue d'Ensemble

"Mon Auxiliaire Déménagement" est une application web conçue pour aider les entreprises de déménagement à gérer leurs opérations quotidiennes. Elle offre une interface centralisée pour la gestion des clients, des prestations (déménagements), des employés, des véhicules, de la facturation, et plus encore.

L'application est construite avec React, Vite, TailwindCSS, et utilise Supabase comme backend pour l'authentification et la persistance des données.

## 2. Démarrage de l'Application (Localement)

Pour lancer l'application sur votre machine locale, suivez ces étapes :

1.  **Prérequis**:
    *   Node.js (version 20 ou supérieure recommandée)
    *   npm (généralement inclus avec Node.js)
    *   Un compte Supabase et un projet configuré (voir section 4).

2.  **Cloner le Dépôt** (si applicable, sinon, vous travaillez déjà dans l'environnement fourni) :
    ```bash
    git clone [URL_DU_DEPOT]
    cd mon-auxiliaire-demenagement
    ```

3.  **Installer les Dépendances**:
    Ouvrez un terminal à la racine du projet et exécutez :
    ```bash
    npm install
    ```
    Cette commande lira le fichier `package.json` et installera toutes les bibliothèques nécessaires.

4.  **Configuration de Supabase**:
    *   Assurez-vous que votre fichier `src/lib/supabaseClient.js` contient les bonnes URL et clé anonyme (anon key) de votre projet Supabase :
        ```javascript
        // src/lib/supabaseClient.js
        import { createClient } from '@supabase/supabase-js';

        const supabaseUrl = 'VOTRE_URL_SUPABASE'; // Remplacez par l'URL de votre projet Supabase
        const supabaseAnonKey = 'VOTRE_CLE_ANON_SUPABASE'; // Remplacez par votre clé anonyme Supabase

        export const supabase = createClient(supabaseUrl, supabaseAnonKey);
        ```
    *   **Important**: Les identifiants Supabase (URL et clé anon) sont publics et destinés à être utilisés côté client. Ne jamais exposer votre clé `service_role` dans le code frontend.

5.  **Lancer le Serveur de Développement**:
    Exécutez la commande suivante dans votre terminal :
    ```bash
    npm run dev
    ```
    Cela démarrera le serveur de développement Vite. Vous devriez voir une URL s'afficher dans le terminal (généralement `http://localhost:5173` ou un port similaire).

6.  **Ouvrir l'Application**:
    Ouvrez votre navigateur web et accédez à l'URL fournie par Vite.

## 3. Fonctionnement Général de l'Application

L'application est organisée en plusieurs modules principaux, accessibles via une barre de navigation latérale après une authentification réussie.

### 3.1 Authentification
*   Les utilisateurs doivent se connecter via la page de login.
*   Deux comptes de test sont prévus (vous devez les créer manuellement dans votre dashboard Supabase Authentication) :
    *   **Super-Admin**: Email `genesis@example.com`, Mot de passe `babayaga369` (Identifiant de connexion: `genesis`)
    *   **Admin**: Email `user@example.com`, Mot de passe `password` (Identifiant de connexion: `user`)
*   Après la création de ces utilisateurs dans Supabase Auth, le trigger `handle_new_user` créera automatiquement leur profil dans la table `public.profiles`. Vous devrez peut-être ajuster manuellement le champ `is_super_admin` et `username` dans la table `profiles` pour `genesis@example.com`.

### 3.2 Modules Principaux
*   **Tableau de Bord**: Vue d'ensemble des KPIs, planning du jour, alertes.
*   **Sites Clients**: Gestion des fiches clients (CRUD).
*   **Prestations**: Planification et suivi des déménagements (CRUD).
*   **Employés**: Gestion du personnel (CRUD).
*   **Véhicules**: Gestion de la flotte de véhicules (CRUD).
*   **Facturation**: Génération et suivi des factures (CRUD).
*   **Calendrier**: Vue globale des prestations et événements.
*   **Rapports**: Analyse des données (consultation).
*   **Profil Utilisateur**: Gestion des informations personnelles et du mot de passe.
*   **Paramètres**: Configuration de l'application (thème, etc.).

Chaque module permet généralement des opérations CRUD (Créer, Lire, Mettre à jour, Supprimer) sur les données correspondantes, qui sont stockées dans la base de données Supabase.

## 4. Base de Données Supabase

L'application utilise Supabase, une plateforme open-source qui fournit une base de données PostgreSQL, une authentification, des API instantanées, du stockage, et plus encore.

### 4.1 Structure de la Base de Données
Les tables principales suivantes sont utilisées (voir le script SQL fourni pour les détails complets des colonnes, relations et politiques RLS) :

*   `public.profiles`: Stocke les informations de profil des utilisateurs, liées à `auth.users`. Contient des champs comme `username`, `full_name`, `avatar_url`, `phone`, `is_super_admin`.
*   `public.clients`: Informations sur les sites clients (nom, adresse, contacts, etc.).
*   `public.prestations`: Détails des déménagements (client associé, dates, adresses, volume, statut, prix, etc.).
*   `public.inventaire_items`: Liste des objets à déménager pour une prestation donnée.
*   `public.checklist_items`: Tâches à accomplir pour une prestation.
*   `public.vehicules`: Informations sur la flotte de véhicules.
*   `public.employes`: Données sur le personnel de l'entreprise.
*   `public.factures`: Informations de facturation liées aux clients et prestations.

### 4.2 Interaction avec la Base de Données
L'application interagit avec Supabase via le client JavaScript `@supabase/supabase-js`. Les opérations typiques incluent :

*   **Lecture (SELECT)**:
    ```javascript
    // Exemple: Récupérer tous les clients
    const { data: clients, error } = await supabase
      .from('clients')
      .select('*');
    if (error) console.error('Error fetching clients:', error);
    else console.log('Clients:', clients);
    ```

*   **Insertion (INSERT)**:
    ```javascript
    // Exemple: Ajouter un nouveau client
    const { data, error } = await supabase
      .from('clients')
      .insert([{ nom: 'Nouveau Client', ville: 'Paris' }])
      .select(); // Pour retourner la ligne insérée
    ```

*   **Mise à jour (UPDATE)**:
    ```javascript
    // Exemple: Mettre à jour un client existant
    const { data, error } = await supabase
      .from('clients')
      .update({ ville: 'Lyon' })
      .eq('id', 'uuid_du_client_a_modifier')
      .select();
    ```

*   **Suppression (DELETE)**:
    ```javascript
    // Exemple: Supprimer un client
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', 'uuid_du_client_a_supprimer');
    ```

### 4.3 Sécurité des Données (Row Level Security - RLS)
Supabase utilise PostgreSQL et permet de définir des politiques RLS pour contrôler l'accès aux données au niveau des lignes.
*   Les politiques RLS sont définies dans le script SQL fourni.
*   Typiquement, elles assurent que :
    *   Les utilisateurs authentifiés peuvent voir et gérer les données (par exemple, tous les clients, toutes les prestations).
    *   Les utilisateurs peuvent insérer et modifier leur propre profil (`profiles` table).
*   Pour des besoins plus granulaires (par exemple, un employé ne voit que les prestations qui lui sont assignées), des politiques RLS plus spécifiques peuvent être ajoutées.

### 4.4 Migration vers une Autre Base de Données
Migrer depuis Supabase (PostgreSQL) vers une autre base de données (par exemple, MySQL, MongoDB) est un processus complexe qui dépend de la cible. Voici les étapes générales :

1.  **Exporter les Données**:
    *   Supabase permet d'exporter vos données PostgreSQL (généralement en format SQL ou CSV). Vous pouvez utiliser les outils de Supabase (Dashboard, CLI) ou des outils PostgreSQL standards comme `pg_dump`.

2.  **Adapter le Schéma**:
    *   Le schéma SQL de PostgreSQL devra être traduit pour la nouvelle base de données. Les types de données, les contraintes, les index, et les fonctions/triggers peuvent différer.
    *   Si vous passez à une base NoSQL (comme MongoDB), vous devrez repenser la structure de vos données en collections et documents.

3.  **Transformer et Importer les Données**:
    *   Les données exportées (CSV, SQL) devront souvent être transformées pour correspondre au nouveau schéma avant d'être importées dans la nouvelle base. Des scripts ETL (Extract, Transform, Load) peuvent être nécessaires.

4.  **Réécrire la Logique d'Accès aux Données**:
    *   Toute la logique d'interaction avec la base de données dans l'application (actuellement via le client Supabase) devra être réécrite pour utiliser le driver ou l'ORM de la nouvelle base de données.
    *   Cela inclut la réécriture des requêtes CRUD.

5.  **Gérer l'Authentification**:
    *   Si la nouvelle solution de base de données n'inclut pas un système d'authentification équivalent à Supabase Auth, vous devrez implémenter ou intégrer un service d'authentification tiers (Auth0, Firebase Auth, Keycloak, ou une solution personnalisée).

6.  **Tester Rigoureusement**:
    *   Une migration de base de données nécessite des tests approfondis pour s'assurer de l'intégrité des données et du bon fonctionnement de l'application.

**Conseil**: Les migrations de base de données sont des opérations majeures. Planifiez soigneusement et testez dans un environnement de staging avant de passer en production. Si possible, choisissez une technologie de base de données et essayez de vous y tenir pour éviter la complexité des migrations.

## 5. Structure du Code Frontend

L'application React est structurée comme suit :

*   `src/components/`: Contient les composants UI réutilisables.
    *   `ui/`: Composants de base de shadcn/ui.
    *   Autres dossiers (ex: `clients/`, `services/`): Composants spécifiques à chaque module (formulaires, boîtes de dialogue de suppression, etc.).
*   `src/contexts/`: Contient les contextes React (ex: `AuthContext`, `ThemeContext`).
*   `src/hooks/`: Contient les hooks personnalisés (ex: `useAuth`).
*   `src/lib/`: Contient les configurations de bibliothèques (ex: `supabaseClient.js`) et les utilitaires.
*   `src/pages/`: Contient les composants de page principaux pour chaque route.
*   `src/App.jsx`: Gère le routage principal et la structure de l'application.
*   `src/main.jsx`: Point d'entrée de l'application React.

Cette documentation devrait vous aider à comprendre le fonctionnement de "Mon Auxiliaire Déménagement", à le démarrer localement, et à interagir avec sa base de données Supabase.

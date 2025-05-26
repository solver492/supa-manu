
# Guide de Démarrage de l'Application Mon Auxiliaire Déménagement

## 🚀 Démarrage sur Replit

### Méthode 1 : Utiliser le bouton Run
1. Cliquez simplement sur le bouton **"Run"** en haut de l'interface Replit
2. L'application se lancera automatiquement et sera accessible via l'URL générée

### Méthode 2 : Terminal Replit
```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

### Méthode 3 : Workflow personnalisé
1. Utilisez le workflow "Démarrer Application" depuis le menu des workflows
2. Cela exécutera automatiquement `npm install` puis `npm run dev`

## 🖥️ Démarrage sur d'autres systèmes

### Prérequis
- Node.js (version 18 ou supérieure)
- npm ou yarn
- Connexion internet pour accéder à Supabase

### Installation et démarrage
```bash
# Cloner le projet (si applicable)
git clone [URL_DU_REPO]
cd mon-auxiliaire-demenagement

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev

# Ou pour la production
npm run build
npm run preview
```

### Configuration
1. Vérifiez que le fichier `.env` contient les bonnes clés Supabase
2. Assurez-vous que la base de données Supabase est accessible
3. L'application sera disponible sur `http://localhost:5173` (ou le port indiqué)

## 🔧 Dépannage

### Problèmes courants
- **Port déjà utilisé** : Changez le port dans vite.config.js
- **Erreur de permission** : Exécutez `chmod +x node_modules/.bin/vite` sur Linux/Mac
- **Erreur "infinite recursion detected in policy"** : 
  1. Connectez-vous à votre tableau de bord Supabase
  2. Allez dans SQL Editor
  3. Exécutez le script `fix_rls_policies.sql` fourni dans le projet
  4. Redémarrez l'application
- **Erreurs de base de données** : Vérifiez les clés Supabase dans `.env`

### Support
- Vérifiez les logs dans la console du navigateur
- Consultez la documentation Supabase pour les problèmes de politique RLS
- Redémarrez le serveur en cas de problème de cache

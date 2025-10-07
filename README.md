# ⚡ Projet Express + Prisma - Backend

## 📂 Structure des fichiers

````text
📦 backend/
├── 📁 src/
│   ├── 📁 config/               # Configuration (CORS, rate limit, etc.)
│   │   ├── cors.config.ts
│   │   ├── env.config.ts
│   │   ├── rateLimit.config.ts
│   │   └── logger.config.ts
│   │
│   ├── 📁 database/
│   │   ├── prismaClient.ts      # Initialisation du client Prisma
│   │   └── seed.ts              # (optionnel) Script de seed de la base
│   │
│   ├── 📁 middleware/
│   │   ├── auth.middleware.ts   # Vérification du JWT
│   │   ├── rbac.middleware.ts   # Contrôle d’accès par rôle
│   │   ├── error.middleware.ts  # Gestion centralisée des erreurs
│   │   └── rateLimiter.middleware.ts
│   │
│   ├── 📁 modules/              # Chaque module = logique métier (feature)
│   │   ├── 📁 auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.types.ts
│   │   │   └── auth.utils.ts    # Ex : génération JWT, validation token, etc.
│   │   │
│   │   ├── 📁 user/
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.routes.ts
│   │   │   └── user.types.ts
│   │   │
│   │   └── (autres modules : product, post, etc.)
│   │
│   ├── 📁 utils/
│   │   ├── responseFactory.ts   # Uniformisation des réponses API
│   │   ├── errorFactory.ts      # Gestion cohérente des erreurs
│   │   ├── jwt.ts               # Fonctions liées aux tokens
│   │   ├── password.ts          # Hash / vérification via Argon2
│   │   └── logger.ts            # Journalisation personnalisée
│   │
│   ├── 📁 types/
│   │   ├── express.d.ts         # Extension des types Express (si besoin)
│   │   └── global.d.ts
│   │
│   ├── app.ts                   # Initialisation d’Express + middlewares globaux
│   ├── routes.ts                # Point central des routes (import des modules)
│   └── server.ts                # Point d’entrée du serveur
│
├── 📁 prisma/
│   ├── schema.prisma            # Schéma Prisma
│   └── migrations/              # Générées automatiquement
│
├── .env                         # Variables d’environnement
├── fichiers de config à ne pas toucher
└── README.md
\\\

## 📜 Règles du dépôt

- ✅ Les variables suivent la convention **camelCase**.
- ✅ **Seul le propriétaire du repo** peut pousser sur \`main\`.
  > ℹ️ Raison : le dépôt est auto-déployé sur **Vercel**, et nous devons limiter le temps de compilation.
- ✅ Chaque **branche** doit porter le **nom d’une issue** correspondante.

## 🌍 Accès au serveur web

Le serveur est déployé ici :
👉 [ https://backend-vamd-corp.onrender.com]( https://backend-vamd-corp.onrender.com)

⚠️ **Cold Start** (plan gratuit) :

- ⏳ Si le site n’a pas été utilisé depuis **15 minutes**, il prend environ **30 secondes à démarrer**.
- 🕒 Le backend subit aussi un **Cold Start**, et les deux peuvent se cumuler.

## ⚙️ Instructions pour les développeurs

Après un `git pull` :

```bash
npm install
````

Créer un fichier `.env` avec à l’intérieur :

```env
DATABASE_URL="postgresql://postgres:le_mot_de_passe/vamd_corp_database?schema=public"
```

Pour démarrer le serveur en local :

```bash
npm run dev
```

Avant de pousser votre code, exécutez :

```bash
npm run lint
npm run build
npm run preview
```

## 🚀 Workflow Git

1. Créer une branche **au nom de l’issue** :
   ```bash
   git checkout -b feature/US-00-nom-de-l-issue
   ```
2. Développer vos fonctionnalités.
3. Commit avec des messages clairs :
   ```bash
   git commit -m "feat: ajout du composant Button"
   ```
4. Pousser votre branche :
   ```bash
   git push origin feature/nom-de-l-issue
   ```
5. Ouvrir une **Pull Request** vers `main`.

## 🛠️ Outils utilisés pour ce projet

- 🎨 **Figma** → création des maquettes et schémas du site web
- 📌 **Trello** → gestion de projet et suivi des tâches
- 💬 **Discord** → messagerie et communication d’équipe
- ▲ **Vercel** → hébergement gratuit du frontend
- 🖥️ **Render** → hébergement gratuit du backend et de la base de données **PostgreSQL**

## PostgreSQL

Installer PostgreSQL :  
[https://www.postgresql.org/download/](https://www.postgresql.org/download/)

Pendant l’installation, choisir :

- Mot de passe pour l’utilisateur `postgres`
- Port par défaut : 5432

Ouvrir le shell Windows :

```bash
cd "C:\\Program Files\\PostgreSQL\\18\\bin"
.\psql --version  # doit renvoyer psql (PostgreSQL) 18.0
.\psql -U postgres  # entrer le mot de passe défini
CREATE DATABASE vamd_corp_database;
```

Coller ensuite dans votre `.env` :

```env
DATABASE_URL="postgresql://postgres:mettreIciLeMdp@localhost:5432/vamd_corp_database?schema=public"
```

Commandes pour lancer le projet :

```bash
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

## 👑 Notes finales

Même si personne ne lit jamais ce README… au moins tu as un guide complet pour ton projet 😎  
Tatakae ! ⚡

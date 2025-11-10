# ⚡ Projet Express + Prisma - Backend

## 📂 Structure des fichiers

```text
📦 backend/
├── 📁 prisma/
│   ├── schema.prisma            # Schéma Prisma
│   ├── seed.ts                  # Script de seed de la base avec les initialisations de la bdd
│   └── migrations/              # Générées automatiquement
│
├── 📁 src/
│   ├── 📁 config/               # Configuration (CORS, rate limit, etc.)
│   │
│   ├── 📁 middleware/
│   │   ├── auth.middleware.ts   # Vérification du JWT
│   │   ├── role.middleware.ts   # Contrôle d’accès par rôle
│   │   ├── error.middleware.ts  # Gestion centralisée des erreurs
│   │   └── verificationExistance.middleware.ts # Verifie si les emails, pasword, ... existe déjà dans la bdd
│   │
│   ├── 📁 controller/              # Chaque module = logique métier (feature)
│   │
│   │   │── auth.controller.ts
│   │   │── equipeInscryption.controller.ts
│   │
│   ├── 📁 routes/
│   │   ├── admin.routes.ts
│   │   ├── auth.routes.ts
│   │   ├── infoUser.routes.ts
│   │   ├── inscryptionEquipe.routes.ts
|   |
│   ├── 📁 utils/
│   │   ├── jwt.ts               # Fonctions liées aux tokens
│   │
│   ├── 📁 types/
│   │   ├── express.d.ts         # Extension des types Express (si besoin)
│   │   └── global.d.ts
│   │
│   ├── app.ts                   # Initialisation d’Express + middlewares globaux
│   ├── routes.ts                # Point central des routes (import des modules)
│   └── server.ts                # Point d’entrée du serveur
│
├── .env                         # Variables d’environnement
├── fichiers de config à ne pas toucher
└── README.md
```

## 📜 Règles du dépôt

- ✅ Les variables suivent la convention **camelCase**.
- ✅ **Seul le propriétaire du repo** peut pousser sur \`main\`.
  > ℹ️ Raison : le dépôt est auto-déployé sur **Vercel**, et nous devons limiter le temps de compilation.
- ✅ Chaque **branche** doit porter le **nom d’une issue** correspondante.

## 🌍 Accès au serveur web

Le serveur est déployé ici :
👉 [ https://backend-vamd-corp.onrender.com](https://backend-vamd-corp.onrender.com)

⚠️ **Cold Start** (plan gratuit) :

- ⏳ Si le site n’a pas été utilisé depuis **15 minutes**, il prend environ **30 secondes à démarrer**.
- 🕒 Le backend subit aussi un **Cold Start**, et les deux peuvent se cumuler.

## ⚙️ Instructions pour les développeurs

Après un `git pull` :

```bash
npm install
```

Créer un fichier `.env` à la racine du projet avec à l’intérieur :

```env
JWT_SECRET="ceci_est_une_clef_secrete_pour_jwt"
ADMIN_PASSWORD="admin123"

JWT_EXPIRES_IN="1h"
PORT=4000
DATABASE_URL="postgresql://postgres:votreMotsDePasse@localhost:5432/vamd_corp_database?schema=public"
FRONTEND_URL="http://localhost:5173"
MODE_PRODUCTION="development"   //"production" si vous l'avez déployer sur le server
```

Pour démarrer le serveur en local :

```bash
npm install
npm run migrate
npm run generate
npm run seed
npm run dev
```

Pour démarrer sur un server :

```bash
npm install  && npm run migrate:force && npm run generate && npm run seed && npm run build
```

Avant de pousser votre code, exécutez :

```bash
npm run lint
npm run build
npm run start
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

## 👑 Notes finales

ce projet a été fait dans le cadre du cours de PGL en équipe de 4

import { PrismaClient, DroitEnum } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Initialisation de la BDD...');

  const droitCount = await prisma.droit.count();

  if (droitCount === 0) {
    console.log('🌱 Aucun droit trouvé, création des 5 droits de base...');

    await prisma.droit.createMany({
      data: [
        { droit: DroitEnum.ADMIN },
        { droit: DroitEnum.PATRON },
        { droit: DroitEnum.COACH },
        { droit: DroitEnum.JOUEUR },
        { droit: DroitEnum.USER },
      ],
    });

    console.log('✅ Droits initiaux insérés avec succès !');
  } else {
    console.log('🗃️ Les droits existent déjà, aucune action nécessaire.');
  }

  // --- 2️⃣ Vérifie si la table des utilisateurs est vide ---
  const userCount = await prisma.user.count();

  if (userCount === 0) {
    console.log('🌱 Aucun utilisateur trouvé, création de l\'administrateur par défaut...');

    // 🔐 Hachage du mot de passe admin
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const hashedPassword = await argon2.hash(adminPassword);

    // 🔎 Récupère l'ID du droit ADMIN
    const droitAdmin = await prisma.droit.findFirst({
      where: { droit: DroitEnum.ADMIN },
    });

    if (!droitAdmin) {
      throw new Error('❌ Droit ADMIN introuvable. Vérifie ton seed des droits.');
    }

    // 👑 Création de l'utilisateur admin
    await prisma.user.create({
      data: {
        pseudo: 'admin',
        nom: 'Root',
        prenom: 'Admin',
        date_naissance: new Date('2001-09-11'),
        email: 'admin@gmail.com',
        password: hashedPassword,
        sexe: 'HOMME',
        id_droit: droitAdmin.id_droit, // <-- Association du droit ADMIN ici !
        description: 'Administrateur suprême du royaume Valorant',
      },
    });

    /* Création d'un utilisateur coach et un joueur par défaut avec une équipe */
    await prisma.user.create({
      data: {
        pseudo: 'coach1',
        nom: 'Coach',
        prenom: 'Premier',
        date_naissance: new Date('1995-05-20'),
        email: 'coach@gmail.com',
        password: await argon2.hash('coach123'),
        sexe: 'HOMME',
        id_droit: (await prisma.droit.findFirst({ where: { droit: DroitEnum.COACH } }))!.id_droit,
        description: 'Coach dévoué pour les équipes de league of legends',
      },
    });

    await prisma.equipe.create({
      data: {
        nom_equipe: 'Team Alpha',
        jeux_equipe: 'LEAGUEOFLEGENDES',
      },    
    });

    await prisma.userEquipe.create({
      data: {
        id_user: (await prisma.user.findFirst({ where: { pseudo: 'coach1' } }))!.id_user,
        id_equipe: (await prisma.equipe.findFirst({ where: { nom_equipe: 'Team Alpha' } }))!.id_equipe,
        poste    : 'COACH',
        sous_role : 'COACH',
      },    
    });

    await prisma.user.create({
      data: {
        pseudo: 'player1',
        nom: 'Player',
        prenom: 'Premier',
        date_naissance: new Date('2000-03-15'),
        email: 'player1@gmail.com',
        password: await argon2.hash('player123'),
        sexe: 'FEMME',
        id_droit: (await prisma.droit.findFirst({ where: { droit: DroitEnum.JOUEUR } }))!.id_droit,
        description: 'Joueuse passionnée de league of legends',
      },
    });

    await prisma.userEquipe.create({
      data: {
        id_user: (await prisma.user.findFirst({ where: { pseudo: 'player1' } }))!.id_user,
        id_equipe: (await prisma.equipe.findFirst({ where: { nom_equipe: 'Team Alpha' } }))!.id_equipe,
        poste    : 'COACH',
        sous_role : 'COACH',
      },    
    });
    
    await prisma.user.create({
      data: {
        pseudo: 'patron1',
        nom: 'xavier',
        prenom: 'niel',
        date_naissance: new Date('1995-05-20'),
        email: 'patron1@gmail.com',
        password: await argon2.hash('patron123'),
        sexe: 'HOMME',
        id_droit: (await prisma.droit.findFirst({ where: { droit: DroitEnum.PATRON } }))!.id_droit,
        description: 'et oui il est le patron de free ',
      },
    });

    console.log('Utilisateur administrateur créé avec succès !');
  } else {
    console.log('Des utilisateurs existent déjà, aucune création d\'admin nécessaire.');
  }

  console.log('Initialisation terminée.');
}

// --- Exécution du script ---
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Erreur durant l\'initialisation :', e);
    await prisma.$disconnect();
    process.exit(1);
  });

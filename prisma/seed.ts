import { PrismaClient, DroitEnum } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Initialisation de la BDD...');

  const droitCount = await prisma.droit.count();

  if (droitCount === 0) {
    console.log('🌱 Aucun droit trouvé, création des 4 droits de base...');

    await prisma.droit.createMany({
      data: [
        { droit: DroitEnum.ADMIN },
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

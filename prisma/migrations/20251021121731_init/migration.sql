/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "JeuxEquipe" AS ENUM ('LEAGUEOFLEGENDES', 'VALORANT', 'FORTNITE');

-- CreateEnum
CREATE TYPE "Poste" AS ENUM ('FORTNITE', 'TOPLANER', 'MIDLANER', 'BOTLANER', 'JUNGLER', 'SUPORT', 'DUELISTS', 'SENTINELS', 'INITIATORS', 'CONTROLLERS', 'POLYVALENT');

-- CreateEnum
CREATE TYPE "SousRole" AS ENUM ('TITULAIRE', 'REMPLACANT', 'COACH', 'CHEFDEQUIPE', 'INSCRIPTION');

-- CreateEnum
CREATE TYPE "DroitEnum" AS ENUM ('ADMIN', 'COACH', 'JOUEUR', 'USER');

-- CreateEnum
CREATE TYPE "SexeEnum" AS ENUM ('HOMME', 'FEMME', 'AUTRE');

-- CreateEnum
CREATE TYPE "Icone" AS ENUM ('AVATAR1', 'AVATAR2', 'AVATAR3');

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "user" (
    "id_user" SERIAL NOT NULL,
    "nom" TEXT,
    "prenom" TEXT,
    "date_naissance" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "sexe" "SexeEnum",
    "pseudo" TEXT NOT NULL,
    "id_droit" INTEGER,
    "icone" "Icone" NOT NULL DEFAULT 'AVATAR1',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "droit" (
    "id_droit" SERIAL NOT NULL,
    "droit" "DroitEnum" NOT NULL,
    "id_event" INTEGER,

    CONSTRAINT "droit_pkey" PRIMARY KEY ("id_droit")
);

-- CreateTable
CREATE TABLE "equipe" (
    "id_equipe" SERIAL NOT NULL,
    "nom_equipe" TEXT NOT NULL,
    "jeux_equipe" "JeuxEquipe" NOT NULL,
    "score_equipe" INTEGER,

    CONSTRAINT "equipe_pkey" PRIMARY KEY ("id_equipe")
);

-- CreateTable
CREATE TABLE "user_equipe" (
    "id_user" INTEGER NOT NULL,
    "id_equipe" INTEGER NOT NULL,
    "poste" "Poste" NOT NULL,
    "sous_role" "SousRole",

    CONSTRAINT "user_equipe_pkey" PRIMARY KEY ("id_user","id_equipe")
);

-- CreateTable
CREATE TABLE "evenement" (
    "id_event" SERIAL NOT NULL,
    "type_event" TEXT NOT NULL,
    "date_heure_debut" TIMESTAMP(3) NOT NULL,
    "date_heure_fin" TIMESTAMP(3) NOT NULL,
    "lieu" TEXT NOT NULL,
    "description" TEXT,
    "titre_event" TEXT NOT NULL,
    "id_user" INTEGER,

    CONSTRAINT "evenement_pkey" PRIMARY KEY ("id_event")
);

-- CreateTable
CREATE TABLE "participation" (
    "id_event" INTEGER NOT NULL,
    "id_user" INTEGER NOT NULL,
    "droit" "DroitEnum" NOT NULL,

    CONSTRAINT "participation_pkey" PRIMARY KEY ("id_event","id_user")
);

-- CreateTable
CREATE TABLE "participation_equipe" (
    "id_equipe" INTEGER NOT NULL,
    "id_event" INTEGER NOT NULL,

    CONSTRAINT "participation_equipe_pkey" PRIMARY KEY ("id_equipe","id_event")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_pseudo_key" ON "user"("pseudo");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_id_droit_fkey" FOREIGN KEY ("id_droit") REFERENCES "droit"("id_droit") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "droit" ADD CONSTRAINT "droit_id_event_fkey" FOREIGN KEY ("id_event") REFERENCES "evenement"("id_event") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_equipe" ADD CONSTRAINT "user_equipe_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_equipe" ADD CONSTRAINT "user_equipe_id_equipe_fkey" FOREIGN KEY ("id_equipe") REFERENCES "equipe"("id_equipe") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evenement" ADD CONSTRAINT "evenement_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participation" ADD CONSTRAINT "participation_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participation" ADD CONSTRAINT "participation_id_event_fkey" FOREIGN KEY ("id_event") REFERENCES "evenement"("id_event") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participation_equipe" ADD CONSTRAINT "participation_equipe_id_equipe_fkey" FOREIGN KEY ("id_equipe") REFERENCES "equipe"("id_equipe") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participation_equipe" ADD CONSTRAINT "participation_equipe_id_event_fkey" FOREIGN KEY ("id_event") REFERENCES "evenement"("id_event") ON DELETE RESTRICT ON UPDATE CASCADE;

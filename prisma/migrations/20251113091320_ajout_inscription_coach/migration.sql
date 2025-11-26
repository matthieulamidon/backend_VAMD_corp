/*
  Warnings:

  - A unique constraint covering the columns `[nom_equipe]` on the table `equipe` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "inscription_coach" (
    "id_user" INTEGER NOT NULL,
    "jeu" "JeuxEquipe" NOT NULL,

    CONSTRAINT "inscription_coach_pkey" PRIMARY KEY ("id_user")
);

-- CreateIndex
CREATE UNIQUE INDEX "inscription_coach_id_user_key" ON "inscription_coach"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "equipe_nom_equipe_key" ON "equipe"("nom_equipe");

-- AddForeignKey
ALTER TABLE "inscription_coach" ADD CONSTRAINT "inscription_coach_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

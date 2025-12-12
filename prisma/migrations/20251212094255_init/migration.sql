-- CreateTable
CREATE TABLE "GrandEvenement" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "type_event" TEXT NOT NULL,
    "date_heure_debut" TIMESTAMP(3) NOT NULL,
    "date_heure_fin" TIMESTAMP(3) NOT NULL,
    "lieu" TEXT,
    "description" TEXT,
    "org_logo" TEXT,
    "game_logo" TEXT,
    "prize" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GrandEvenement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commentaire" (
    "id_commentaire" SERIAL NOT NULL,
    "id_coach" INTEGER NOT NULL,
    "id_joueur" INTEGER NOT NULL,
    "id_event" INTEGER,
    "kds" TEXT NOT NULL,
    "presence" BOOLEAN NOT NULL DEFAULT true,
    "date_commentaire" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commentaire_pkey" PRIMARY KEY ("id_commentaire")
);

-- AddForeignKey
ALTER TABLE "commentaire" ADD CONSTRAINT "commentaire_id_coach_fkey" FOREIGN KEY ("id_coach") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentaire" ADD CONSTRAINT "commentaire_id_joueur_fkey" FOREIGN KEY ("id_joueur") REFERENCES "user"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commentaire" ADD CONSTRAINT "commentaire_id_event_fkey" FOREIGN KEY ("id_event") REFERENCES "evenement"("id_event") ON DELETE SET NULL ON UPDATE CASCADE;

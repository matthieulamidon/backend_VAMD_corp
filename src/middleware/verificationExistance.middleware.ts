import { PrismaClient } from "@prisma/client";
import { verifyAuthCookie } from "../utils/jwt";

export function isEmailExist() {
  return async (req: any) => {
    const { email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { message: "Email invalide" };
    }
    const prisma = new PrismaClient();
    const existing = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existing) {
      return { message: "Email existe déjà" };
    }
    return true;
  };
}

export function isPseudoExist() {
  return async (req: any) => {
    const { pseudo } = req.body;
    const prisma = new PrismaClient();
    const existing = await prisma.user.findUnique({
      where: { pseudo: pseudo },
    });
    if (existing) {
      return { message: "Pseudo existe déjà" };
    }
    return true;
  };
}

export function isDateGoodFormat(dateString: string | Date) {
  const dateNaissanceObj = new Date(dateString);
  if (Number.isNaN(dateNaissanceObj.getTime())) {
    return {
      message: "Date de naissance invalide. Format attendu : YYYY-MM-DD",
    };
  }
  return true;
}

export function isAuthantificate(req: any) {
  let userData: any;
  try {
    userData = verifyAuthCookie(req);
  } catch (error) {
    console.error("Erreur de vérification du cookie :", error);
    return { message: "Utilisateur non authentifié" };
  }
  return userData;
}

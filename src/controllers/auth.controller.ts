import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import {
  clearAuthCookie,
  setAuthCookie,
  signToken,
  verifyAuthCookie,
} from "../utils/jwt";

const prisma = new PrismaClient();

/* register: permet de generer un nouvelle utilisateur */
export async function register(req: Request, res: Response) {
  const { pseudo, email, password, date_naissance } = req.body;
  const role = "USER";

  console.log(
    "Enregistrement de l'utilisateur avec ces informations:",
    req.body
  );

  // Vérification des champs obligatoires
  if (!pseudo || !email || !password || !date_naissance) {
    return res.status(400).json({
      message:
        "Pseudo, email, mot de passe et date de naissance sont obligatoires",
    });
  }

  // Vérification du format de la date
  const dateNaissanceObj = new Date(date_naissance);
  if (Number.isNaN(dateNaissanceObj.getTime())) {
    return res.status(400).json({
      message: "Date de naissance invalide. Format attendu : YYYY-MM-DD",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Email invalide" });
  }

  // Vérification mot de passe (exemple : min 6 caractères)
  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Cet email est déjà utilisé" });
    }

    const existing2 = await prisma.user.findUnique({ where: { pseudo } });
    if (existing2) {
      return res.status(409).json({ message: "Ce Pseudo est déjà utilisé" });
    }

    const hash = await argon2.hash(password);

    const droitUser = await prisma.droit.findFirst({ where: { droit: role } });
    if (!droitUser) {
      throw new Error(
        " droit USER introuvable. Vérifie que la BDD a bien été npm run seed."
      );
    }

    console.log("Droit utilisateur trouvé:", droitUser);
    const user = await prisma.user.create({
      data: {
        pseudo,
        email,
        date_naissance: dateNaissanceObj,
        password: hash,
        id_droit: droitUser.id_droit,
      },
    });

    const token = signToken({
      userId: user.id_user,
      role: user.id_droit,
      pseudo: user.pseudo,
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id_user,
        email: user.email,
        role: user.id_droit,
        pseudo: user.pseudo,
        date_naissance: user.date_naissance,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* login: permet de generer cookie d'authentification */
export async function login(req: Request, res: Response) {
  const { emailOrPseudo, password } = req.body;
  console.log(
    "Tentative de connexion avec ces informations:",
    emailOrPseudo,
    password
  );

  if (!emailOrPseudo || !password) {
    return res.status(400).json({
      message: "l'email/pseudo et/ou le mots de passe est/sont invalide ",
    });
  }

  try {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let user: any | null = null;
    if (emailRegex.test(emailOrPseudo)) {
      user = await prisma.user.findUnique({
        where: { email: emailOrPseudo },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { pseudo: emailOrPseudo },
      });
    }

    if (!user) {
      return res.status(401).json({
        message: "l'email/pseudo et/ou le mots de passe est/sont invalide 2",
      });
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return res.status(401).json({
        message: "erreur serveur les cookies ne peuvent être générer",
      });
    }

    const token = signToken({
      userId: user.id_user,
      role: user.id_droit,
      pseudo: user.pseudo,
    });

    //créé le cookie d'authentification
    const tokenCookies = setAuthCookie(res, {
      userId: user.id_user,
      role: user.id_droit,
      pseudo: user.pseudo,
    });

    return res.json({
      token,
      tokenCookies,
      user: {
        id: user.id_user,
        email: user.email,
        role: user.id_droit,
        pseudo: user.pseudo,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

/* me: verifie le cookie d'authentification */
export async function me(req: Request, res: Response) {
  try {
    console.log(
      "Récupération des informations de l'utilisateur pour la requête:",
      //req.method,
      //req.url,
      req
    );
    const decoded = verifyAuthCookie(req);
    res.status(200).json({ message: "Bienvenue !", user: decoded });
  } catch {
    res.status(401).json({ message: "Non autorisé" });
  }
}

/* Logout: supprime le cookie d'authentification */
export async function logout(req: Request, res: Response) {
  try {
    clearAuthCookie(res);
    res.json({ message: "Déconnexion réussie" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la déconnexion" });
  }
}

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { setAuthCookie, signToken, verifyAuthCookie } from "../utils/jwt";

const prisma = new PrismaClient();

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

    const hash = await argon2.hash(password);

    const droitUser = await prisma.droit.findFirst({ where: { droit: role } });
    if (!droitUser) {
      throw new Error(
        " roit USER introuvable. Vérifie que la BDD a bien été npm run seed."
      );
    }

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

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "l'email et/ou le mots de passe est/sont invalide " });
  }

  try {
    // On force le typage complet ici pour éviter toute confusion TS
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: "les cookies sont invalide" });
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return res.status(401).json({ message: "les cookies sont invalide" });
    }

    const token = signToken({
      userId: user.id_user,
      role: user.id_droit,
      pseudo: user.pseudo,
    });

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

export async function me(req: Request, res: Response) {
  try {
    console.log(
      "Récupération des informations de l'utilisateur pour la requête:",
      //req.method,
      //req.url,
      req
    );
    const decoded = verifyAuthCookie(req);
    res.json({ message: "Bienvenue !", user: decoded });
  } catch {
    res.status(401).json({ message: "Non autorisé" });
  }
}

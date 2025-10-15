import { Request, Response } from "express";
import { PrismaClient, User } from "@prisma/client";
import argon2 from "argon2";
import { signToken } from "../utils/jwt";

const prisma = new PrismaClient();

export async function register(req: Request, res: Response) {
  const { email, password, role, subRole } = req.body;
  console.log(
    "Enregistrement de l'utilisateur utilise ses informations:",
    req.body
  );

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email et le mots de passe sont obligatoire" });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Cette email est déjà utiliser" });
    }

    const hash = await argon2.hash(password);

    // Prisma connaît tous les champs de ton modèle User, donc plus d’erreur ici :
    const user = await prisma.user.create({
      data: {
        email,
        password: hash,
        role: role || "USER",
        subRole: subRole || null,
      },
    });

    // On s'assure que TS connaît bien le type complet
    const token = signToken({
      userId: user.id,
      role: user.role,
      subRole: user.subRole,
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        subRole: user.subRole,
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
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // On force le typage complet ici pour éviter toute confusion TS
    const user = (await prisma.user.findUnique({
      where: { email },
    })) as User | null;

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      subRole: user.subRole,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        subRole: user.subRole,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}

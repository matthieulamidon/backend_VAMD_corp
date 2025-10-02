import express from "express";
import prisma from "./prisma";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Récupérer tous les users
app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany({ include: { posts: true } });
  res.json(users);
});

// Créer un user
app.post("/users", async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await prisma.user.create({ data: { name, email } });
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Créer un post lié à un user
app.post("/posts", async (req, res) => {
  const { title, content, authorId } = req.body;
  const post = await prisma.post.create({ data: { title, content, authorId } });
  res.json(post);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/blog - List blog posts
router.get('/', async (req, res) => {
  try {
    const posts = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve blog posts' });
  }
});

// GET /api/blog/:id - Read single post
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.blog.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve blog post' });
  }
});

// POST /api/blog - Create blog post (Admin only)
router.post('/', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { title, content, imageUrl } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  try {
    const post = await prisma.blog.create({
      data: {
        title,
        content,
        imageUrl: imageUrl || null,
        author: req.user!.name,
      },
    });
    res.status(201).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// PUT /api/blog/:id - Edit blog post (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, content, imageUrl } = req.body;

  try {
    const post = await prisma.blog.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    const updatedPost = await prisma.blog.update({
      where: { id },
      data: { title, content, imageUrl },
    });
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// DELETE /api/blog/:id - Delete blog post (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const post = await prisma.blog.findUnique({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: 'Blog post not found' });
    }

    await prisma.blog.delete({ where: { id } });
    res.status(200).json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

export default router;

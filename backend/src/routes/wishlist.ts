import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// POST /api/wishlist/:appId - Add to wishlist
router.post('/:appId', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { appId } = req.params;
  const userId = req.user!.id;

  try {
    const existing = await prisma.wishlistItem.findFirst({
      where: { appId, userId },
    });

    if (existing) {
      return res.status(200).json(existing);
    }

    const item = await prisma.wishlistItem.create({
      data: { appId, userId },
      include: { app: true },
    });

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add item to wishlist' });
  }
});

// DELETE /api/wishlist/:appId - Remove from wishlist
router.delete('/:appId', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { appId } = req.params;
  const userId = req.user!.id;

  try {
    const existing = await prisma.wishlistItem.findFirst({
      where: { appId, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Item not in wishlist' });
    }

    await prisma.wishlistItem.delete({
      where: { id: existing.id },
    });

    res.status(200).json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to remove item from wishlist' });
  }
});

export default router;

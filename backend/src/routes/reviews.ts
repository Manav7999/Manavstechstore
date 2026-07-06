import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Helper to recalculate app average rating
async function updateAppAverageRating(appId: string) {
  const reviews = await prisma.review.findMany({
    where: { appId },
    select: { rating: true },
  });

  if (reviews.length === 0) return;

  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const avg = Math.round((sum / reviews.length) * 10) / 10; // Round to 1 decimal place

  await prisma.app.update({
    where: { id: appId },
    data: { rating: avg },
  });
}

// POST /api/reviews/:appId - Post a review
router.post('/:appId', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { appId } = req.params;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    const app = await prisma.app.findUnique({ where: { id: appId } });
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Check if user already reviewed this app, if so update it, otherwise create
    const userId = req.user!.id;
    const existingReview = await prisma.review.findFirst({
      where: { appId, userId },
    });

    let review;
    if (existingReview) {
      review = await prisma.review.update({
        where: { id: existingReview.id },
        data: { rating, comment },
      });
    } else {
      review = await prisma.review.create({
        data: {
          appId,
          userId,
          rating,
          comment: comment || '',
        },
      });
    }

    // Recalculate average rating
    await updateAppAverageRating(appId);

    res.status(201).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to post review' });
  }
});

// POST /api/reviews/:reviewId/helpful - Upvote a review
router.post('/:reviewId/helpful', async (req, res) => {
  const { reviewId } = req.params;

  try {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { helpfulCount: { increment: 1 } },
    });

    res.status(200).json(updatedReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upvote review' });
  }
});

// POST /api/reviews/:reviewId/reply - Submit developer reply (Admin only)
router.post('/:reviewId/reply', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { reviewId } = req.params;
  const { reply } = req.body;

  if (!reply) {
    return res.status(400).json({ error: 'Reply text is required' });
  }

  try {
    const review = await prisma.review.findUnique({ where: { id: reviewId } });
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { developerReply: reply },
    });

    res.status(200).json(updatedReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add developer reply' });
  }
});

export default router;

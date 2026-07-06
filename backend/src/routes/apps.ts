import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';
import { searchAppsWithAi, generatePersonalizedSuggestions } from '../services/ai';

const router = Router();
const prisma = new PrismaClient();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit to 50MB (apks can be large)
});

// Helper to calculate SHA-256 checksum of local files
function getFileChecksum(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', err => reject(err));
  });
}

// GET /api/apps - List apps with filtering, searching, sorting
router.get('/', async (req, res) => {
  const {
    category,
    search,
    sort,
    offline,
    aiPowered,
    featured,
    trending,
    editorsChoice,
  } = req.query;

  try {
    const where: any = {};

    // Filter by Category slug
    if (category) {
      where.category = { slug: String(category) };
    }

    // Filter by Boolean flags
    if (offline === 'true') {
      where.isOffline = true;
    }
    if (aiPowered === 'true') {
      where.isAiPowered = true;
    }
    if (featured === 'true') {
      where.isFeatured = true;
    }
    if (trending === 'true') {
      where.isTrending = true;
    }
    if (editorsChoice === 'true') {
      where.isEditorsChoice = true;
    }

    // Filter by standard search query (keyword matching name/packageName/shortDesc)
    if (search) {
      const searchTerm = String(search).toLowerCase();
      where.OR = [
        { name: { contains: searchTerm } },
        { packageName: { contains: searchTerm } },
        { shortDescription: { contains: searchTerm } },
      ];
    }

    // Sort order
    let orderBy: any = { createdAt: 'desc' }; // default
    if (sort === 'popular') {
      orderBy = { downloadsCount: 'desc' };
    } else if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sort === 'alphabetical') {
      orderBy = { name: 'asc' };
    }

    const apps = await prisma.app.findMany({
      where,
      orderBy,
      include: {
        category: true,
        screenshots: true,
      },
    });

    res.status(200).json(apps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve applications' });
  }
});

// POST /api/apps/ai-search - AI Natural Language Search
router.post('/ai-search', async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const allApps = await prisma.app.findMany({
      include: {
        category: true,
        screenshots: true,
      },
    });

    const searchResults = searchAppsWithAi(allApps, query);
    res.status(200).json(searchResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'AI search query failed' });
  }
});

// GET /api/apps/recommendations - Personalized suggestions
router.post('/recommendations', async (req, res) => {
  const { downloadHistoryPackNames } = req.body; // Array of package names user previously downloaded
  const history = Array.isArray(downloadHistoryPackNames) ? downloadHistoryPackNames : [];

  try {
    const allApps = await prisma.app.findMany({
      include: { category: true, screenshots: true },
    });

    const suggestions = generatePersonalizedSuggestions(allApps, history);
    res.status(200).json(suggestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// GET /api/apps/:id - Detailed app view
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const app = await prisma.app.findUnique({
      where: { id },
      include: {
        category: true,
        screenshots: true,
        reviews: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Get recommendations from same category
    const relatedApps = await prisma.app.findMany({
      where: {
        categoryId: app.categoryId,
        id: { not: app.id },
      },
      take: 4,
    });

    res.status(200).json({ app, relatedApps });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to retrieve application details' });
  }
});

// POST /api/apps/:id/download - Track & download APK
router.get('/:id/download', async (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId as string;

  try {
    const app = await prisma.app.findUnique({ where: { id } });
    if (!app) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Increment downloads count in DB
    await prisma.app.update({
      where: { id },
      data: { downloadsCount: { increment: 1 } },
    });

    // Record history if user is logged in
    if (userId) {
      await prisma.downloadHistory.create({
        data: {
          appId: app.id,
          userId: userId,
          version: app.versionName,
        },
      });
    }

    // If local APK is registered, download file stream
    if (app.apkUrl && app.apkUrl.startsWith('/uploads/')) {
      const fileName = app.apkUrl.replace('/uploads/', '');
      const filePath = path.resolve(__dirname, '../../uploads', fileName);

      if (fs.existsSync(filePath)) {
        // Calculate SHA-256 to send in headers
        const checksum = await getFileChecksum(filePath);
        res.setHeader('X-SHA256-Checksum', checksum);
        return res.download(filePath, `${app.name}-${app.versionName}.apk`);
      }
    }

    // Otherwise redirect/return remote URL
    res.json({ apkUrl: app.apkUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to initiate download' });
  }
});

// POST /api/apps - Upload new app (Admin only)
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: 'apkFile', maxCount: 1 },
    { name: 'iconFile', maxCount: 1 },
    { name: 'bannerFile', maxCount: 1 },
    { name: 'screenshotFiles', maxCount: 8 },
  ]),
  async (req: AuthRequest, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const body = req.body;

    if (!body.name || !body.packageName || !body.categoryId) {
      return res.status(400).json({ error: 'Name, Package Name, and Category ID are required' });
    }

    try {
      const apkUrl = files?.['apkFile']?.[0] ? `/uploads/${files['apkFile'][0].filename}` : body.apkUrl || '#';
      const iconUrl = files?.['iconFile']?.[0] ? `/uploads/${files['iconFile'][0].filename}` : body.iconUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&q=80';
      const bannerUrl = files?.['bannerFile']?.[0] ? `/uploads/${files['bannerFile'][0].filename}` : body.bannerUrl || null;

      const screenshotUrls = files?.['screenshotFiles']
        ? files['screenshotFiles'].map(f => `/uploads/${f.filename}`)
        : [];

      const app = await prisma.app.create({
        data: {
          name: body.name,
          packageName: body.packageName,
          shortDescription: body.shortDescription || '',
          description: body.description || '',
          versionName: body.versionName || '1.0.0',
          versionCode: parseInt(body.versionCode) || 1,
          apkUrl,
          iconUrl,
          bannerUrl,
          appSize: body.appSize || 'Unknown',
          minAndroid: body.minAndroid || '8.0',
          targetAndroid: body.targetAndroid || '13.0',
          isOffline: body.isOffline === 'true',
          isAiPowered: body.isAiPowered === 'true',
          isFeatured: body.isFeatured === 'true',
          isTrending: body.isTrending === 'true',
          isEditorsChoice: body.isEditorsChoice === 'true',
          supportEmail: body.supportEmail || null,
          websiteUrl: body.websiteUrl || null,
          githubUrl: body.githubUrl || null,
          linkedinUrl: body.linkedinUrl || null,
          categoryId: body.categoryId,
          screenshots: {
            create: screenshotUrls.map(url => ({ url })),
          },
        },
        include: {
          category: true,
          screenshots: true,
        },
      });

      res.status(201).json(app);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create application entry' });
    }
  }
);

// PUT /api/apps/:id - Edit app details (Admin only)
router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: 'apkFile', maxCount: 1 },
    { name: 'iconFile', maxCount: 1 },
    { name: 'bannerFile', maxCount: 1 },
    { name: 'screenshotFiles', maxCount: 8 },
  ]),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const body = req.body;

    try {
      const existingApp = await prisma.app.findUnique({ where: { id } });
      if (!existingApp) {
        return res.status(404).json({ error: 'Application not found' });
      }

      const updateData: any = {
        name: body.name,
        packageName: body.packageName,
        shortDescription: body.shortDescription,
        description: body.description,
        versionName: body.versionName,
        versionCode: body.versionCode ? parseInt(body.versionCode) : undefined,
        appSize: body.appSize,
        minAndroid: body.minAndroid,
        targetAndroid: body.targetAndroid,
        isOffline: body.isOffline === undefined ? undefined : body.isOffline === 'true',
        isAiPowered: body.isAiPowered === undefined ? undefined : body.isAiPowered === 'true',
        isFeatured: body.isFeatured === undefined ? undefined : body.isFeatured === 'true',
        isTrending: body.isTrending === undefined ? undefined : body.isTrending === 'true',
        isEditorsChoice: body.isEditorsChoice === undefined ? undefined : body.isEditorsChoice === 'true',
        supportEmail: body.supportEmail,
        websiteUrl: body.websiteUrl,
        githubUrl: body.githubUrl,
        linkedinUrl: body.linkedinUrl,
        categoryId: body.categoryId,
      };

      // File updates
      if (files?.['apkFile']?.[0]) {
        updateData.apkUrl = `/uploads/${files['apkFile'][0].filename}`;
      }
      if (files?.['iconFile']?.[0]) {
        updateData.iconUrl = `/uploads/${files['iconFile'][0].filename}`;
      }
      if (files?.['bannerFile']?.[0]) {
        updateData.bannerUrl = `/uploads/${files['bannerFile'][0].filename}`;
      }

      // If new screenshots are uploaded, delete existing and create new
      if (files?.['screenshotFiles']) {
        await prisma.screenshot.deleteMany({ where: { appId: id } });
        updateData.screenshots = {
          create: files['screenshotFiles'].map(f => ({ url: `/uploads/${f.filename}` })),
        };
      }

      const updatedApp = await prisma.app.update({
        where: { id },
        data: updateData,
        include: {
          category: true,
          screenshots: true,
        },
      });

      res.status(200).json(updatedApp);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update application entry' });
    }
  }
);

// DELETE /api/apps/:id - Delete app (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const existingApp = await prisma.app.findUnique({ where: { id } });
    if (!existingApp) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Clean up local files if applicable
    const fileUrls = [existingApp.apkUrl, existingApp.iconUrl, existingApp.bannerUrl].filter(Boolean) as string[];
    const screenshots = await prisma.screenshot.findMany({ where: { appId: id } });
    fileUrls.push(...screenshots.map(s => s.url));

    fileUrls.forEach(url => {
      if (url.startsWith('/uploads/')) {
        const filePath = path.resolve(__dirname, '../../uploads', url.replace('/uploads/', ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    });

    await prisma.app.delete({ where: { id } });
    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete application entry' });
  }
});

export default router;

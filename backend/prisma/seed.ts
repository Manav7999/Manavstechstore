import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const WORKSPACE_DIR = path.resolve(__dirname, '../../');
const UPLOADS_DIR = path.resolve(__dirname, '../uploads');

// Helper to copy files if they exist
function copyFileIfExists(srcName: string, destName: string): string | null {
  const srcPath = path.join(WORKSPACE_DIR, srcName);
  const destPath = path.join(UPLOADS_DIR, destName);

  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${srcName} -> backend/uploads/${destName}`);
    return `/uploads/${destName}`;
  }
  console.warn(`File not found: ${srcName}`);
  return null;
}

async function main() {
  console.log('Starting seed process...');

  // Ensure uploads directory exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Clear existing database records
  await prisma.screenshot.deleteMany();
  await prisma.review.deleteMany();
  await prisma.downloadHistory.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.app.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.blog.deleteMany();

  console.log('Cleared existing database tables.');

  // Create default Admin User
  const passwordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@manavstech.com',
      passwordHash,
      name: 'Manav Dutt',
      role: 'ADMIN',
    },
  });

  // Create regular test user
  const userPasswordHash = await bcrypt.hash('user123', 10);
  const normalUser = await prisma.user.create({
    data: {
      email: 'tester@gmail.com',
      passwordHash: userPasswordHash,
      name: 'Jane Doe',
      role: 'USER',
    },
  });

  console.log('Created Admin and User accounts.');

  // Create Categories
  const categoriesData = [
    { name: 'AI Powered', slug: 'ai-powered', icon: 'Sparkles' },
    { name: 'Android Utilities', slug: 'utilities', icon: 'Cpu' },
    { name: 'Productivity', slug: 'productivity', icon: 'CheckSquare' },
    { name: 'Communication', slug: 'communication', icon: 'MessageSquare' },
    { name: 'Entertainment', slug: 'entertainment', icon: 'Play' },
    { name: 'Developer Tools', slug: 'developer-tools', icon: 'Terminal' },
  ];

  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const record = await prisma.category.create({
      data: cat,
    });
    categories[cat.slug] = record;
  }

  console.log('Created categories.');

  // Copy files for CDialer
  const cDialerApk = copyFileIfExists('CDialer apk file.apk', 'cdialer.apk');
  const cDialerIcon = copyFileIfExists('CDialer app icon.png', 'cdialer-icon.png');
  const cDialerScreens = [
    copyFileIfExists('CDialer Dashboard image1.jpg.jpeg', 'cdialer-screen-1.jpg'),
    copyFileIfExists('CDialer Dashboard image2.jpg.jpeg', 'cdialer-screen-2.jpg'),
    copyFileIfExists('CDialer Dashboard image3.jpg.jpeg', 'cdialer-screen-3.jpg'),
    copyFileIfExists('CDialer Dashboard image4.jpg.jpeg', 'cdialer-screen-4.jpg'),
    copyFileIfExists('CDialer Dashboard image5.jpg.jpeg', 'cdialer-screen-5.jpg'),
  ].filter(Boolean) as string[];

  // Copy files for MPlayer
  const mPlayerApk = copyFileIfExists('Mplayer apk file.apk', 'mplayer.apk');
  const mPlayerIcon = copyFileIfExists('Mplayer app icon.png', 'mplayer-icon.png');
  const mPlayerScreens = [
    copyFileIfExists('MPlayer Dashboard image1.jpg.jpeg', 'mplayer-screen-1.jpg'),
    copyFileIfExists('MPlayer Dashboard image2.jpg.jpeg', 'mplayer-screen-2.jpg'),
    copyFileIfExists('MPlayer Dashboard image3.jpg.jpeg', 'mplayer-screen-3.jpg'),
  ].filter(Boolean) as string[];

  // Copy files for MyNote
  const myNoteApk = copyFileIfExists('MyNote apk file.apk', 'mynote.apk');
  const myNoteIcon = copyFileIfExists('Mynote app icon.png', 'mynote-icon.png');
  const myNoteScreens = [
    copyFileIfExists('Mynote Dashboard image1.jpg.jpeg', 'mynote-screen-1.jpg'),
    copyFileIfExists('Mynote Dashboard image2.jpg.jpeg', 'mynote-screen-2.jpg'),
    copyFileIfExists('Mynote Dashboard image3.jpg.jpeg', 'mynote-screen-3.jpg'),
    copyFileIfExists('Mynote Dashboard image4.jpg.jpeg', 'mynote-screen-4.jpg'),
  ].filter(Boolean) as string[];

  // Copy files for ChatMe
  const chatMeApk = copyFileIfExists('ChatMe apk file.apk', 'chatme.apk');
  const chatMeIcon = copyFileIfExists('chatmeappicon.png', 'chatme-icon.png') || copyFileIfExists('ChatMe app icon.png', 'chatme-icon.png');
  const chatMeScreens = [
    copyFileIfExists('ChatMe Dashboard image1.jpg.jpeg', 'chatme-screen-1.jpg'),
    copyFileIfExists('ChatMe Dashboard image2.jpg.jpeg', 'chatme-screen-2.jpg'),
    copyFileIfExists('ChatMe Dashboard image3.jpg.jpeg', 'chatme-screen-3.jpg'),
    copyFileIfExists('ChatMe Dashboard image4.jpg.jpeg', 'chatme-screen-4.jpg'),
  ].filter(Boolean) as string[];

  // Insert CDialer App
  const cdialer = await prisma.app.create({
    data: {
      name: 'CDialer',
      packageName: 'com.manavstech.cdialer',
      shortDescription: 'A clean, modern dialer with smart contact group management.',
      description: 'CDialer is a premium Android phone dialer replacement application. It features Material You theme implementation, modern sleek keypad controls, and an advanced contacts management dashboard. Designed with user privacy in mind, it operates entirely offline without unnecessary permissions.',
      versionName: '1.2.4',
      versionCode: 15,
      apkUrl: cDialerApk || '/uploads/cdialer.apk',
      iconUrl: cDialerIcon || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=800&q=80',
      appSize: '24.3 MB',
      minAndroid: '8.0 (Oreo)',
      targetAndroid: '14.0 (Upside Down Cake)',
      rating: 4.8,
      downloadsCount: 1540,
      isOffline: true,
      isFeatured: true,
      isTrending: true,
      isEditorsChoice: false,
      categoryId: categories['communication'].id,
      supportEmail: 'support@manavstech.com',
      websiteUrl: 'https://manavstech.com',
      githubUrl: 'https://github.com/manavdutt/cdialer',
      screenshots: {
        create: cDialerScreens.map(url => ({ url })),
      },
    },
  });

  // Insert MPlayer
  const mplayer = await prisma.app.create({
    data: {
      name: 'MPlayer',
      packageName: 'com.manavstech.mplayer',
      shortDescription: 'Modern local music player with a beautiful visualizer.',
      description: 'MPlayer is a highly optimized offline music player for Android. It supports a wide range of audio formats including FLAC, MP3, and WAV. Includes dynamic theme matching, a high-fidelity visualizer, custom gapless playback, and audio enhancement controls built for audiophiles.',
      versionName: '2.0.1',
      versionCode: 22,
      apkUrl: mPlayerApk || '/uploads/mplayer.apk',
      iconUrl: mPlayerIcon || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=128&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=800&q=80',
      appSize: '26.1 MB',
      minAndroid: '9.0 (Pie)',
      targetAndroid: '14.0',
      rating: 4.9,
      downloadsCount: 2310,
      isOffline: true,
      isFeatured: false,
      isTrending: true,
      isEditorsChoice: true,
      categoryId: categories['entertainment'].id,
      supportEmail: 'support@manavstech.com',
      websiteUrl: 'https://manavstech.com',
      githubUrl: 'https://github.com/manavdutt/mplayer',
      screenshots: {
        create: mPlayerScreens.map(url => ({ url })),
      },
    },
  });

  // Insert MyNote
  const mynote = await prisma.app.create({
    data: {
      name: 'MyNote',
      packageName: 'com.manavstech.mynote',
      shortDescription: 'Secure note-taking with Markdown support and offline encryption.',
      description: 'MyNote is a productivity-first notes application focusing on security and speed. It features fully localized AES-256 database encryption, rich markdown editor support, tags and folder structures, and dynamic checklist tools. Zero trackers, zero cloud dependencies.',
      versionName: '1.0.5',
      versionCode: 8,
      apkUrl: myNoteApk || '/uploads/mynote.apk',
      iconUrl: myNoteIcon || 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=128&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1522252234503-e356532cafd5?w=800&q=80',
      appSize: '16.5 MB',
      minAndroid: '8.0',
      targetAndroid: '13.0 (Tiramisu)',
      rating: 4.7,
      downloadsCount: 920,
      isOffline: true,
      isFeatured: true,
      isTrending: false,
      isEditorsChoice: true,
      categoryId: categories['productivity'].id,
      supportEmail: 'support@manavstech.com',
      websiteUrl: 'https://manavstech.com',
      githubUrl: 'https://github.com/manavdutt/mynote',
      screenshots: {
        create: myNoteScreens.map(url => ({ url })),
      },
    },
  });

  // Insert ChatMe
  const chatme = await prisma.app.create({
    data: {
      name: 'ChatMe',
      packageName: 'com.manavstech.chatme',
      shortDescription: 'Real-time peer-to-peer encrypted messaging app.',
      description: 'ChatMe provides end-to-end encrypted messaging designed for direct, secure communications. It operates over local networks or direct peer connections with no central server storage of messages, protecting metadata and transcripts completely.',
      versionName: '1.0.0',
      versionCode: 3,
      apkUrl: chatMeApk || '/uploads/chatme.apk',
      iconUrl: chatMeIcon || 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=128&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80',
      appSize: '235.9 KB',
      minAndroid: '7.0 (Nougat)',
      targetAndroid: '13.0',
      rating: 4.6,
      downloadsCount: 450,
      isOffline: false,
      isFeatured: false,
      isTrending: false,
      isEditorsChoice: false,
      categoryId: categories['communication'].id,
      supportEmail: 'support@manavstech.com',
      websiteUrl: 'https://manavstech.com',
      githubUrl: 'https://github.com/manavdutt/chatme',
      screenshots: {
        create: chatMeScreens.map(url => ({ url })),
      },
    },
  });

  console.log('Seeded all apps.');

  // Create mock reviews for apps
  await prisma.review.createMany({
    data: [
      {
        appId: cdialer.id,
        userId: normalUser.id,
        rating: 5,
        comment: 'Absolutely love the clean layout and Material Design 3 elements! The contact grouping is incredibly handy and it respects my privacy.',
        helpfulCount: 12,
        developerReply: 'Thank you Jane! Glad you appreciate the privacy-first model and Material design implementation.',
      },
      {
        appId: cdialer.id,
        userId: adminUser.id,
        rating: 5,
        comment: 'Fast dialer, does not lag at all compared to the default Google Dialer on low end chips.',
        helpfulCount: 4,
      },
      {
        appId: mplayer.id,
        userId: normalUser.id,
        rating: 5,
        comment: 'Visualizer is stunning! Gapless playback runs flawlessly with my FLAC collection. Strongly recommended.',
        helpfulCount: 22,
        developerReply: 'Awesome! Audiophile-grade playback was a major engineering goal for MPlayer.',
      },
      {
        appId: mynote.id,
        userId: normalUser.id,
        rating: 4,
        comment: 'Strong offline markdown notes app. It is simple, fast, and does not require complex subscriptions.',
        helpfulCount: 9,
      },
      {
        appId: chatme.id,
        userId: normalUser.id,
        rating: 4,
        comment: 'Nice decentralized messaging application, perfect for fast communications in local wifi setups.',
        helpfulCount: 3,
      }
    ],
  });

  // Create mock blogs
  await prisma.blog.createMany({
    data: [
      {
        title: 'Announcing ManavsTech Store - The Launch of a Modern Software Hub',
        content: 'Welcome to ManavsTech Store! Today, we are proud to introduce a consolidated marketplace showcasing my Android applications. From utility solutions like CDialer to media tools like MPlayer, this store offers direct, secure APK downloads and version tracking. Built with modern Material 3 aesthetics and privacy-focused engineering, this represents a new step for our distribution model.',
        author: 'Manav Dutt',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'
      },
      {
        title: 'Building CDialer: An Offline First Contact Management App',
        content: 'CDialer was created to solve a specific issue: bloated default dialer applications tracking contact metrics and requiring constant network requests. By compiling contacts purely offline and utilizing the latest Android APIs for smooth phone operations, CDialer shows that utilities can be beautiful, fast, and secure.',
        author: 'Manav Dutt',
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80'
      }
    ]
  });

  console.log('Mock database seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

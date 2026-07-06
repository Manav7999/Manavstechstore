import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Providers from '../components/Providers';
import BackToTop from '../components/BackToTop';
import BottomNav from '../components/BottomNav';

export const metadata: Metadata = {
  title: 'ManavsTech Store - Modern Android App Marketplace',
  description: 'Discover, explore, and download high-quality, secure Android applications developed by Manav Dutt. Home to CDialer, MPlayer, MyNote, MGPT, and more.',
  keywords: 'Manav Dutt, ManavsTech, Android Apps, APK Store, CDialer, MPlayer, MyNote, MGPT, AI apps, secure downloads',
  authors: [{ name: 'Manav Dutt' }],
  openGraph: {
    title: 'ManavsTech Store - Android App Marketplace',
    description: 'Discover, explore, and download premium Android applications built by Manav Dutt.',
    url: 'https://store.manavstech.com',
    siteName: 'ManavsTech Store',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ManavsTech Store - Android App Marketplace',
    description: 'Discover and download high-quality Android apps from ManavsTech.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col justify-between" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="flex-grow pt-24 pb-20 md:pb-0">
            {children}
          </main>
          <Footer />
          <BottomNav />
          <BackToTop />
        </Providers>
      </body>
    </html>
  );
}

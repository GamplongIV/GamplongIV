import './globals.css';
import { Poppins } from 'next/font/google'; 
import SiteShell from './components/site-shell';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'], 
  variable: '--font-poppins', 
});

const MAIN_BG = "bg-white"; 

export const metadata = {
  title: "Padukuhan Gamplong IV",
  description: "Website resmi Padukuhan Gamplong IV",
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body className={`min-h-screen ${MAIN_BG} font-[var(--font-poppins)]`}>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
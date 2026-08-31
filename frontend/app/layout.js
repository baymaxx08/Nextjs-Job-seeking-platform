import './globals.css';
import { Manrope, Space_Grotesk } from 'next/font/google';

import { Navbar } from '../components/layout/Navbar';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' });

export const metadata = {
  title: 'Job Portal',
  description: 'Production-ready full-stack job portal for seekers and providers.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} bg-slate-50 text-slate-950`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
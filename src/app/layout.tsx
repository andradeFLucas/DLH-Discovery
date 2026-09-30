import type { Metadata } from 'next';
import { Archivo, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-plex-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BANCO_IDEIAS_URL || 'http://localhost:3000'),
  title: 'Banco de Ideias com IA | Discovery & Governança',
  description:
    'Transforme ideias de colaboradores em propostas estruturadas com prototipagem por IA, documentação técnica, pitch comercial e governança estratégica.',
};

// Evita "flash" de tema errado: aplica a classe salva antes da primeira pintura.
const themeScript = `
(function () {
  try {
    var t = localStorage.getItem('banco_ideias_theme');
    document.documentElement.classList.add(t === 'light' ? 'light' : 'dark');
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${archivo.variable} ${plexMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 antialiased selection:bg-blue-600 selection:text-white light:bg-zinc-50 light:text-zinc-900">
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}

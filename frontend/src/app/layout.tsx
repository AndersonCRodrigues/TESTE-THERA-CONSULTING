import "@/app/global.css";
import SessionProvider from "@/contexts/SessionProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meu Projeto Next",
  description: "Aplicação Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
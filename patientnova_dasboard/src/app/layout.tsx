import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { SessionProvider } from 'next-auth/react';
import "./globals.css";

const dmSans = DM_Sans({
  subsets: [ "latin" ],
  weight: [ "400", "500", "600", "700" ],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Patient Nova",
  description: "Dashboard para gestionar pacientes, citas y más.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={dmSans.className}>
      <body>
        <SessionProvider>
          <NuqsAdapter>
            {children}
          </NuqsAdapter>
        </SessionProvider>
      </body>
    </html>
  );
}

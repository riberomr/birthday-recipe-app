import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/AuthContext";
import { Navbar } from "@/components/Navbar";
import { SnackbarProvider } from "@/components/ui/Snackbar";
import { ModalProvider } from "@/lib/contexts/ModalContext";
import { ModalRegistry } from "@/components/ModalRegistry";
import Providers from "@/app/providers";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Recetario La María",
  description: "Recetas de mi cocina a la tuya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Providers>
            <AuthProvider>
              <SnackbarProvider>
                <ModalProvider>
                  <div className="min-h-screen flex flex-col">
                    <Navbar />
                    <div className="flex-1">
                      {children}
                    </div>
                  </div>
                  <ModalRegistry />
                </ModalProvider>
              </SnackbarProvider>
            </AuthProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

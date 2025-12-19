import { ReduxProvider } from "@/lib/providers";
import type React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ReduxProvider>
          <main className="flex-1 p-4">{children}</main>
        </ReduxProvider>
      </body>
    </html>
  );
}

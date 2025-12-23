import { ReduxProvider } from "@/lib/providers";
import type React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
        <ReduxProvider>
          <main className="flex-1 p-4">{children}</main>
        </ReduxProvider>
  );
}

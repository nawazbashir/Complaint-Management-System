"use client";

import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadFromStorage } from "@/lib/features/auth-slice";
import type { RootState } from "@/lib/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    dispatch(loadFromStorage());
    setIsLoading(false);
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

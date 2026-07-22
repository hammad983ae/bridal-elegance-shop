import type { ReactNode } from "react";
import { useCartSync } from "@/hooks/useCartSync";

export function CartSyncProvider({ children }: { children: ReactNode }) {
  useCartSync();
  return <>{children}</>;
}
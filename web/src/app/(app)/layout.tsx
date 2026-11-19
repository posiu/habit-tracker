import { Suspense } from "react";
import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-3xl lg:max-w-5xl px-5 pb-36 pt-8">
      {children}
      <Suspense fallback={null}>
        <BottomNav />
      </Suspense>
    </div>
  );
}

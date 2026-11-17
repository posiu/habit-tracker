import { redirect } from "next/navigation";
import { Suspense } from "react";
import { todayIn } from "@/lib/domain/entries";
import { getTimeZone } from "@/lib/queries";

async function ToToday() {
  redirect(`/daily/${todayIn(await getTimeZone())}`);
  return null;
}

export default function DailyIndex() {
  return (
    <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
      <ToToday />
    </Suspense>
  );
}

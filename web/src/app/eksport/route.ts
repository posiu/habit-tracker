import { NextResponse } from "next/server";
import { toCsv } from "@/lib/domain/reports";
import { createClient } from "@/lib/supabase/server";

const PAGE = 1000; // PostgREST caps a response at 1000 rows

type Row = {
  completed: boolean;
  boolean_value: boolean | null;
  numeric_value: number | null;
  time_value: number | null;
  habits: { name: string; habit_type: string; unit: string | null } | null;
  daily_entries: { entry_date: string; mood: number | null; notes: string | null } | null;
};

/** CSV of the signed-in user's habit entries (RLS limits it to their own rows). */
export async function GET() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return new NextResponse("Unauthorized", { status: 401 });

  const rows: Row[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("habit_entries")
      .select(
        "completed,boolean_value,numeric_value,time_value,habits(name,habit_type,unit),daily_entries!inner(entry_date,mood,notes)",
      )
      .order("created_at")
      .range(from, from + PAGE - 1);
    if (error) return new NextResponse("Export failed", { status: 500 });
    rows.push(...(data as unknown as Row[]));
    if (data.length < PAGE) break;
  }

  rows.sort((a, b) => (a.daily_entries?.entry_date ?? "").localeCompare(b.daily_entries?.entry_date ?? ""));
  const csv = toCsv(
    ["data", "nawyk", "typ", "wartosc", "jednostka", "ukonczone", "nastroj", "notatka"],
    rows.map((r) => [
      r.daily_entries?.entry_date,
      r.habits?.name,
      r.habits?.habit_type,
      r.numeric_value ?? r.time_value ?? (r.boolean_value === null ? null : r.boolean_value ? 1 : 0),
      r.habits?.habit_type === "time" ? "min" : r.habits?.unit,
      r.completed ? "tak" : "nie",
      r.daily_entries?.mood,
      r.daily_entries?.notes,
    ]),
  );

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="habit-tracker-export.csv"',
      "Cache-Control": "no-store",
    },
  });
}

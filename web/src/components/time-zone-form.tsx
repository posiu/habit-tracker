"use client";

import { useActionState } from "react";
import { saveTimeZone, type SettingsState } from "@/app/(app)/ustawienia/actions";
import { SubmitButton, inputClass } from "./field";

export function TimeZoneForm({ current, zones }: { current: string; zones: string[] }) {
  const [state, action, pending] = useActionState<SettingsState, FormData>(saveTimeZone, undefined);
  return (
    <form action={action} className="space-y-3">
      <label className="block space-y-1.5">
        <span className="block text-xs text-muted">Strefa czasowa (decyduje, kiedy zaczyna się „dziś”)</span>
        <select name="time_zone" defaultValue={current} className={inputClass}>
          {zones.map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>
      </label>
      {state?.error && <p role="alert" className="text-sm text-red-400">{state.error}</p>}
      {state?.saved && <p role="status" className="text-sm text-[#8ce563]">Zapisano.</p>}
      <div className="flex"><SubmitButton pending={pending}>Zapisz strefę</SubmitButton></div>
    </form>
  );
}

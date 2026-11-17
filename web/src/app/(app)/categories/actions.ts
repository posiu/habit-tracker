"use server";

import { redirect } from "next/navigation";
import { categoryFromForm, rawValues, type RawValues } from "@/lib/domain/form-data";
import { categorySchema, fieldErrors, type FieldErrors } from "@/lib/domain/schemas";
import { createClient } from "@/lib/supabase/server";

export type FormState = { errors?: FieldErrors; values?: RawValues } | undefined;

const DUPLICATE = "23505";

export async function saveCategory(id: string | null, _prev: FormState, fd: FormData): Promise<FormState> {
  const parsed = categorySchema.safeParse(categoryFromForm(fd));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: rawValues(fd) };

  const supabase = await createClient();
  const row = {
    name: parsed.data.name,
    color: parsed.data.color ?? null,
    icon: parsed.data.icon ?? null,
    description: parsed.data.description ?? null,
  };
  const { error } = id
    ? await supabase.from("categories").update(row).eq("id", id)
    : await supabase.from("categories").insert(row);

  if (error?.code === DUPLICATE) return { errors: { name: "Kategoria o tej nazwie już istnieje" }, values: rawValues(fd) };
  if (error) return { errors: { _form: "Nie udało się zapisać kategorii. Spróbuj ponownie." }, values: rawValues(fd) };
  redirect("/categories");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  // Habits and goals keep existing: the FK is ON DELETE SET NULL.
  await supabase.from("categories").delete().eq("id", id);
  redirect("/categories");
}

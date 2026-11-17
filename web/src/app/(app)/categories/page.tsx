import Link from "next/link";
import { Suspense } from "react";
import { listCategories } from "@/lib/queries";

async function CategoryList() {
  const categories = await listCategories();
  if (categories.length === 0) {
    return <p className="text-sm text-zinc-500">Brak kategorii. Dodaj pierwszą.</p>;
  }
  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {categories.map((c) => (
        <li key={c.id} className="flex items-center gap-3 py-3">
          <span className="size-3 rounded-full" style={{ background: c.color ?? "#a1a1aa" }} />
          <span className="font-medium">{c.icon} {c.name}</span>
          {c.description && <span className="truncate text-sm text-zinc-500">{c.description}</span>}
          <Link href={`/categories/${c.id}/edit`} className="ml-auto text-sm underline">Edytuj</Link>
        </li>
      ))}
    </ul>
  );
}

export default function CategoriesPage() {
  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kategorie</h1>
        <Link href="/categories/new" className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-zinc-900">Nowa kategoria</Link>
      </div>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <CategoryList />
      </Suspense>
    </main>
  );
}

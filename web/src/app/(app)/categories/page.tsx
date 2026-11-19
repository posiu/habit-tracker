import Link from "next/link";
import { Suspense } from "react";
import { listCategories } from "@/lib/queries";

async function CategoryList() {
  const categories = await listCategories();
  if (categories.length === 0) {
    return <p className="text-sm text-muted">Brak kategorii. Dodaj pierwszą.</p>;
  }
  return (
    <ul className="space-y-2">
      {categories.map((c) => (
        <li key={c.id} className="flex items-center gap-3 py-3">
          <span className="size-3 rounded-full" style={{ background: c.color ?? "#a1a1aa" }} />
          <span className="font-medium">{c.icon} {c.name}</span>
          {c.description && <span className="truncate text-sm text-muted">{c.description}</span>}
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
        <h1 className="text-[34px] font-bold tracking-tight">Kategorie</h1>
        <Link href="/categories/new" className="flex h-11 items-center rounded-full bg-surface-2 px-4 text-[15px] font-semibold">Nowa kategoria</Link>
      </div>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <CategoryList />
      </Suspense>
    </main>
  );
}

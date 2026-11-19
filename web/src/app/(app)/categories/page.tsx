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
        <li key={c.id} className="flex items-center gap-3 rounded-3xl bg-surface p-4">
          <span aria-hidden="true" className="size-3 flex-none rounded-full" style={{ background: c.color ?? "#a1a1aa" }} />
          <div className="min-w-0">
            <p className="text-[17px] font-semibold">{c.icon} {c.name}</p>
            {c.description && <p className="truncate text-sm text-muted">{c.description}</p>}
          </div>
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

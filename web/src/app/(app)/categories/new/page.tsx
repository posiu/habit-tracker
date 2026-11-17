import { CategoryForm } from "@/components/category-form";

export default function NewCategoryPage() {
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">Nowa kategoria</h1>
      <CategoryForm />
    </main>
  );
}

import { CategoryForm } from "@/components/category-form";
import { PageHeader } from "@/components/page-header";

export default function NewCategoryPage() {
  return (
    <main className="space-y-6">
      <PageHeader title="Nowa kategoria" back={{ href: "/categories", label: "Kategorie" }} />
      <CategoryForm />
    </main>
  );
}

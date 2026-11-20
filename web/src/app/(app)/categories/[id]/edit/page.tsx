import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deleteCategory } from "../../actions";
import { CategoryForm } from "@/components/category-form";
import { DeleteButton } from "@/components/delete-button";
import { getCategory } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";

async function Editor({ params }: { params: PageProps<"/categories/[id]/edit">["params"] }) {
  const { id } = await params;
  const category = await getCategory(id);
  if (!category) notFound();
  return (
    <>
      <CategoryForm category={category} />
      <div className="pt-4">
        <DeleteButton
          action={deleteCategory.bind(null, category.id)}
          confirmText="Usunąć kategorię? Nawyki i cele pozostaną, ale bez kategorii."
          label="Usuń kategorię"
        />
      </div>
    </>
  );
}

export default function EditCategoryPage(props: PageProps<"/categories/[id]/edit">) {
  return (
    <main className="space-y-6">
      <PageHeader title="Edytuj kategorię" back={{ href: "/categories", label: "Kategorie" }} />
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Editor params={props.params} />
      </Suspense>
    </main>
  );
}

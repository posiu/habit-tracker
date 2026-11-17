import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deleteCategory } from "../../actions";
import { CategoryForm } from "@/components/category-form";
import { DeleteButton } from "@/components/delete-button";
import { getCategory } from "@/lib/queries";

async function Editor({ params }: { params: PageProps<"/categories/[id]/edit">["params"] }) {
  const { id } = await params;
  const category = await getCategory(id);
  if (!category) notFound();
  return (
    <>
      <CategoryForm category={category} />
      <div className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
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
      <h1 className="text-2xl font-semibold">Edytuj kategorię</h1>
      <Suspense fallback={<p className="text-sm">Ładowanie…</p>}>
        <Editor params={props.params} />
      </Suspense>
    </main>
  );
}

import { notFound } from "next/navigation";
import { deleteCompanionAction } from "@/app/admin/actions";
import { CompanionForm } from "@/components/CompanionForm";
import { getCompanion } from "@/lib/data";

export default async function EditCompanionPage(props: PageProps<"/admin/companions/[id]">) {
  const { id } = await props.params;
  const companion = await getCompanion(id);
  if (!companion) notFound();
  return (
    <main>
      <h1 className="mb-4 text-lg font-semibold">Edit {companion.name}</h1>
      <CompanionForm companion={companion} />
      <details className="mt-8 rounded-3xl border border-line px-5 py-4 text-sm">
        <summary className="cursor-pointer text-muted">Delete {companion.name}</summary>
        <p className="mt-3 text-muted">Deletes her profile and every user&apos;s chats with her. To just hide her, untick &quot;Live&quot; instead.</p>
        <form action={deleteCompanionAction.bind(null, companion.id)} className="mt-4">
          <button type="submit" className="w-full rounded-full bg-red-500/15 py-3 font-semibold text-red-300">
            Delete permanently
          </button>
        </form>
      </details>
    </main>
  );
}

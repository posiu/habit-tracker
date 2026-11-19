"use client";

export function DeleteButton({ action, confirmText, label = "Usuń" }: { action: () => Promise<void>; confirmText: string; label?: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      <button type="submit" className="text-sm text-red-400 underline">
        {label}
      </button>
    </form>
  );
}

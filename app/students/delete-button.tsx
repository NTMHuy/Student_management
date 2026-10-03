"use client";

export default function DeleteButton({
  action,
  confirmText = "Bạn có chắc muốn xóa?",
  className = "text-red-600",
}: {
  action: () => Promise<void>;
  confirmText?: string;
  className?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <button type="submit" className={className}>
        Xóa
      </button>
    </form>
  );
}

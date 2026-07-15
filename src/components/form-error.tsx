import { AlertCircle } from "lucide-react";

/**
 * Inline field-level validation message. Renders nothing when there's no error
 * so it can be dropped under any field unconditionally. Pair the `id` with the
 * input's `aria-describedby` for accessibility.
 */
export function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="flex items-center gap-1.5 text-[13px] font-medium text-[#dc2626]"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

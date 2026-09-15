"use client";
import { useId, type ReactNode } from "react";
export interface FieldControlProps {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
  required?: boolean;
}
export interface FormFieldProps {
  id?: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  children: (props: FieldControlProps) => ReactNode;
}
/** Form-state agnostic: pass Formik values, touched errors and handlers into the control. */
export function FormField({
  id,
  label,
  hint,
  error,
  required,
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const describedBy =
    [hint ? `${controlId}-hint` : null, error ? `${controlId}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div className="np-field">
      <label htmlFor={controlId}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children({
        id: controlId,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        required,
      })}
      {hint && (
        <div className="np-field-hint" id={`${controlId}-hint`}>
          {hint}
        </div>
      )}
      {error && (
        <div className="np-field-error" id={`${controlId}-error`}>
          {error}
        </div>
      )}
    </div>
  );
}

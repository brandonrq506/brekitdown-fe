import { useId, type ReactNode } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type FieldControlProps = {
  label: ReactNode;
  description?: ReactNode;
  error?: string;
};

const useFieldControl = ({
  id,
  ariaDescribedBy,
  description,
  error,
}: {
  id?: string;
  ariaDescribedBy?: string;
  description?: ReactNode;
  error?: string;
}) => {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy =
    [ariaDescribedBy, descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return { controlId, describedBy, descriptionId, errorId };
};

export type InputFieldProps = React.ComponentProps<typeof Input> & FieldControlProps;

export const InputField = ({
  id,
  label,
  description,
  error,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  disabled,
  ...props
}: InputFieldProps) => {
  const { controlId, describedBy, descriptionId, errorId } = useFieldControl({
    id,
    ariaDescribedBy,
    description,
    error,
  });
  const invalid = Boolean(error) || (Boolean(ariaInvalid) && ariaInvalid !== "false");

  return (
    <Field data-disabled={disabled || undefined} data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={controlId}>{label}</FieldLabel>
      <Input
        {...props}
        id={controlId}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
      />
      {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </Field>
  );
};

export type TextareaFieldProps = React.ComponentProps<typeof Textarea> & FieldControlProps;

export const TextareaField = ({
  id,
  label,
  description,
  error,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  disabled,
  ...props
}: TextareaFieldProps) => {
  const { controlId, describedBy, descriptionId, errorId } = useFieldControl({
    id,
    ariaDescribedBy,
    description,
    error,
  });
  const invalid = Boolean(error) || (Boolean(ariaInvalid) && ariaInvalid !== "false");

  return (
    <Field data-disabled={disabled || undefined} data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={controlId}>{label}</FieldLabel>
      <Textarea
        {...props}
        id={controlId}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
      />
      {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </Field>
  );
};

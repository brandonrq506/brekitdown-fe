import { useId, type ReactNode } from "react";

import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

/**
 * A node that is guaranteed to render something.
 *
 * Excluding `null` and booleans leaves omitting the prop as the only way to say
 * "no description", so the generated id, the rendered element, and
 * `aria-describedby` cannot disagree. Pass `cond ? node : undefined` rather than
 * `cond && node`.
 */
type RenderableNode = Exclude<ReactNode, null | boolean>;

type FieldControlProps = {
  label: ReactNode;
  description?: RenderableNode;
  error?: string;
};

type AriaInvalid = React.AriaAttributes["aria-invalid"];

/**
 * `aria-invalid` accepts the string "false", which is truthy while meaning valid,
 * so a caller forwarding it would otherwise be reported as invalid.
 */
const isAriaInvalid = (ariaInvalid: AriaInvalid) =>
  ariaInvalid !== undefined && ariaInvalid !== false && ariaInvalid !== "false";

const useFieldControl = ({
  id,
  ariaDescribedBy,
  ariaInvalid,
  description,
  error,
}: {
  id?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: AriaInvalid;
  description?: RenderableNode;
  error?: string;
}) => {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const hasDescription = description !== undefined;
  const hasError = error !== undefined && error !== "";
  const descriptionId = hasDescription ? `${controlId}-description` : undefined;
  const errorId = hasError ? `${controlId}-error` : undefined;
  const describedBy =
    [ariaDescribedBy, descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return {
    controlId,
    describedBy,
    descriptionId,
    errorId,
    hasDescription,
    hasError,
    invalid: hasError || isAriaInvalid(ariaInvalid),
  };
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
  const { controlId, describedBy, descriptionId, errorId, hasDescription, hasError, invalid } =
    useFieldControl({ id, ariaDescribedBy, ariaInvalid, description, error });

  return (
    <Field data-disabled={disabled === true || undefined} data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={controlId}>{label}</FieldLabel>
      <Input
        {...props}
        id={controlId}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
      />
      {hasDescription && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
      {hasError && <FieldError id={errorId}>{error}</FieldError>}
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
  const { controlId, describedBy, descriptionId, errorId, hasDescription, hasError, invalid } =
    useFieldControl({ id, ariaDescribedBy, ariaInvalid, description, error });

  return (
    <Field data-disabled={disabled === true || undefined} data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={controlId}>{label}</FieldLabel>
      <Textarea
        {...props}
        id={controlId}
        disabled={disabled}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
      />
      {hasDescription && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
      {hasError && <FieldError id={errorId}>{error}</FieldError>}
    </Field>
  );
};

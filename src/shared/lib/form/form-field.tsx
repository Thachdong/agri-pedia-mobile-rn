import type { ReactElement } from 'react';
import { Controller, type Control, type FieldPath, type FieldPathValue, type FieldValues } from 'react-hook-form';

export type TFormFieldRenderProps<T extends FieldValues, TName extends FieldPath<T>> = {
  value: FieldPathValue<T, TName>;
  onChange: (value: FieldPathValue<T, TName>) => void;
  onBlur: () => void;
  /** Message of the field's error (joi or server), undefined when valid. */
  error?: string;
  /** Pass to the TextInput `ref` so `form.setFocus(name)` and next-field focus work. */
  ref: (instance: unknown) => void;
};

export type TFormFieldProps<T extends FieldValues, TName extends FieldPath<T>> = {
  control: Control<T>;
  name: TName;
  render: (field: TFormFieldRenderProps<T, TName>) => ReactElement;
};

/**
 * Binds one field of a `useAppForm` form to an input — components use this instead of react-hook-form's Controller.
 * No validation rules here: the joi schema is the only source.
 */
export function FormField<T extends FieldValues, TName extends FieldPath<T>>({
  control,
  name,
  render,
}: TFormFieldProps<T, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) =>
        render({
          value: field.value,
          onChange: field.onChange,
          onBlur: field.onBlur,
          error: fieldState.error?.message,
          ref: field.ref,
        })
      }
    />
  );
}

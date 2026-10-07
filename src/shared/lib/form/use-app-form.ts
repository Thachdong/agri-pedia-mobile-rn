import { joiResolver } from '@hookform/resolvers/joi';
import { useForm, type FieldValues, type UseFormProps, type UseFormReturn } from 'react-hook-form';
import type { TSchema } from '@/shared/lib/validation';

export type TAppFormOptions<T extends FieldValues> = Omit<UseFormProps<T>, 'resolver'> & {
  /** The feature's joi schema (`features/<x>/schemas/*.schema.ts`) — the only source of validation. */
  schema: TSchema<T>;
};

export type TAppForm<T extends FieldValues> = UseFormReturn<T>;

export function useAppForm<T extends FieldValues>({
  schema,
  mode = 'onTouched',
  ...options
}: TAppFormOptions<T>): TAppForm<T> {
  return useForm<T>({ ...options, mode, resolver: joiResolver(schema) });
}

import Joi from 'joi';
import { messages } from './messages';

/** The project's joi instance — import `v` from `@/shared/lib/validation`, never `joi` directly. */
export const v: Joi.Root = Joi.defaults((schema) =>
  schema.options({
    abortEarly: false,
    errors: { wrap: { label: false } },
    messages,
  }),
);

import { ApiError } from './error.js';

/**
 * Replaces req[source] with the parsed/stripped Zod output so controllers only
 * ever see fields the schema actually declares.
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    // Recorded before parsing, because parsing fills in schema defaults and we
    // lose the ability to tell "sent as empty" from "not sent at all".
    if (source === 'body') {
      req.submittedKeys =
        req.body && typeof req.body === 'object' ? Object.keys(req.body) : [];
    }

    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = {};
      for (const issue of result.error.issues) {
        details[issue.path.join('.') || '_'] = issue.message;
      }
      return next(new ApiError(422, 'Validation failed', details));
    }
    if (source === 'query') {
      // Express 5 exposes req.query via a getter, so assign onto a stable field.
      req.validatedQuery = result.data;
    } else {
      req[source] = result.data;
    }
    next();
  };
}

/**
 * Narrows a parsed body down to the keys the client actually sent.
 *
 * Zod re-applies a field's `.default()` whenever the key is missing — even on a
 * `.partial()` schema — so without this a PATCH carrying one field would reset
 * every other field to its default. Use it for every partial update.
 */
export function pickSubmitted(req) {
  const sent = new Set(req.submittedKeys ?? []);
  return Object.fromEntries(Object.entries(req.body ?? {}).filter(([key]) => sent.has(key)));
}

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFound(req, res) {
  res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity.
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }

  // Duplicate key (unique index) -> 409 rather than a generic 500.
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0] ?? 'field';
    return res.status(409).json({ error: `That ${field} is already taken.` });
  }

  if (err?.name === 'ValidationError') {
    return res.status(422).json({
      error: 'Validation failed',
      details: Object.fromEntries(
        Object.entries(err.errors).map(([key, value]) => [key, value.message]),
      ),
    });
  }

  if (err?.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
  }

  console.error('[error]', err);
  const message =
    process.env.NODE_ENV === 'production' ? 'Something went wrong.' : err.message;
  res.status(err.status || 500).json({ error: message });
}

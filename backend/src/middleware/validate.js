function validateSchema(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const flattened = result.error.flatten();
      const firstIssue = result.error.issues?.[0];
      let message = 'Validation error';

      if (firstIssue) {
        const fieldName = firstIssue.path?.length ? firstIssue.path.join('.') : '';
        message = fieldName ? `${fieldName}: ${firstIssue.message}` : firstIssue.message;
      }

      return res.status(400).json({
        success: false,
        data: null,
        message,
        errors: flattened,
      });
    }

    req[source] = result.data;
    return next();
  };
}

module.exports = {
  validateSchema,
};
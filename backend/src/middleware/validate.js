function validateSchema(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Validation error',
        errors: result.error.flatten(),
      });
    }

    req[source] = result.data;
    return next();
  };
}

module.exports = {
  validateSchema,
};
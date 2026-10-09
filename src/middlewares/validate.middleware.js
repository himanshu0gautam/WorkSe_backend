export const validateRequest = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const formattedErrors = result.error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }));

    return res.status(400).json({
      success: false,
      message: formattedErrors[0].message, // Returns primary error message
      errors: formattedErrors,
    });
  }
  // Replace req.body with sanitized & cleaned data
  req.body = result.data;
  next();
};

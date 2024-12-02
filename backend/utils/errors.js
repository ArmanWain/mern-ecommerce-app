export class ErrorHandler extends Error {
  constructor(message, statusCode, type, name) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.name = name;

    // Create stack property
    Error.captureStackTrace(this, this.constructor);
  }
}

export const addError = (productId, productErrors) => {
  const product = productErrors.find((product) => product.productId === productId);
  if (product) {
    product.errorCount += 1;
  } else {
    productErrors.push({
      productId,
      errorCount: 1
    });
  }

  return productErrors;
};
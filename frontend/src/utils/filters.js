export const getPriceQueryParams = (searchParams, key, value) => {
  const paramExists = searchParams.has(key);

  if (value && paramExists) {
    searchParams.set(key, value);
  } else if (value) {
    searchParams.append(key, value);
  } else if (paramExists) {
    searchParams.delete(key);
  }

  return searchParams;
};
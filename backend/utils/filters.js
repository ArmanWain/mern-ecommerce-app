import Product from "../models/product.js";

export const productFilters = (queryParams) => {
  let query;

  // Handle filter for the keyword
  const keyword = queryParams.keyword ?
    {
      $or: [
        {
          name: { // Case-insensitive partial match on 'name'
            $regex: queryParams.keyword,
            $options: "i",
          }
        },
        {
          category: { // Exact case-insensitive match on 'category'
            $regex: `^${queryParams.keyword}$`,
            $options: 'i',
          }
        }
      ]
    }
    :
    {};

  query = Product.find({ ...keyword });

  // Handle filter for out of stock products
  if (!queryParams.notAvailable) {
    query = query.find({ stock: { $gt: "0" } });
  }

  // Remove fields not in the schema
  const queryParamsCopy = { ...queryParams };

  const fieldsToRemove = ["keyword", "page", "notAvailable"];
  fieldsToRemove.forEach((field) => delete queryParamsCopy[field]);

  // Handle filters for price, rating, and category
  query = query.find(queryParamsCopy);

  return query;
};
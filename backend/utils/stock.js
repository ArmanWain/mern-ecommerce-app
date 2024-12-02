import Product from "../models/product.js";
import { ErrorHandler } from "./errors.js";

export const reserveStock = async (orderItems, actualItems) => {
  let lastIndex;

  try {
    for (let i = 0; i < actualItems.length; i++) {
      const newStock = actualItems[i].stock - orderItems[i].quantity;

      actualItems[i].stock = newStock;

      await actualItems[i].save();
      lastIndex = i;
    }
  } catch (error) {
    if (lastIndex || lastIndex === 0) {
      // Return items to stock
      for (let i = 0; i < lastIndex + 1; i++) {
        const newStock = actualItems[i].stock + orderItems[i].quantity;

        actualItems[i].stock = newStock;

        await actualItems[i].save();
      }
    }

    return new ErrorHandler(error.message, 500, { reserveStockError: true }, error.name);
  }
};

export const returnStock = async (orderItems) => {
  for (let i = 0; i < orderItems.length; i++) {
    const product = await Product.findById(orderItems[i].productId);

    if (!product) {
      continue;
    }

    product.stock = product.stock + orderItems[i].quantity

    await product.save();
  }
}
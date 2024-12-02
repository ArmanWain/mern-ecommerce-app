import mongoose from "mongoose";
import products from "./data.js";
import Product from "../models/product.js";
import dotenv from "dotenv";

const seedProducts = async () => {
  dotenv.config({ path: "backend/config/config.env" });

  try {
    await mongoose.connect(process.env.DB_LOCAL_URI);

    await Product.deleteMany();
    console.log("Products are deleted");

    await Product.insertMany(products);
    console.log("Products are added");

    process.exit();
  } catch (error) {
    console.log(error.message);
    process.exit();
  }
};

seedProducts();

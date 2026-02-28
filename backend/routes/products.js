const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/products/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname),
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed"));
  },
});

// Get all products with filters
router.get("/", async (req, res) => {
  try {
    const { category, search, sort, brand, minPrice, maxPrice, size } =
      req.query;
    let query = {};

    if (category) query.category = category;
    if (brand) query.brand = { $regex: brand, $options: "i" };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (size) query.sizes = size;

    let products = Product.find(query);

    switch (sort) {
      case "price-asc":
        products = products.sort({ price: 1 });
        break;
      case "price-desc":
        products = products.sort({ price: -1 });
        break;
      case "rating":
        products = products.sort({ rating: -1 });
        break;
      case "newest":
        products = products.sort({ createdAt: -1 });
        break;
      case "discount":
        products = products.sort({ discount: -1 });
        break;
      default:
        products = products.sort({ createdAt: -1 });
    }

    const result = await products;
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product (Admin)
router.post("/", auth, admin, upload.array("images", 5), async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      discount,
      category,
      subCategory,
      brand,
      sizes,
      colors,
      stock,
      tags,
    } = req.body;

    const images = req.files.map(
      (file) => `/uploads/products/${file.filename}`,
    );

    const product = await Product.create({
      name,
      description,
      price,
      originalPrice: originalPrice || price,
      discount: discount || 0,
      category,
      subCategory,
      brand,
      sizes: sizes ? JSON.parse(sizes) : [],
      colors: colors ? JSON.parse(colors) : [],
      stock,
      images,
      tags: tags ? JSON.parse(tags) : [],
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update product (Admin)
router.put("/:id", auth, admin, upload.array("images", 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const updateFields = [
      "name",
      "description",
      "price",
      "originalPrice",
      "discount",
      "category",
      "subCategory",
      "brand",
      "stock",
    ];
    updateFields.forEach((field) => {
      if (req.body[field] !== undefined && req.body[field] !== "") {
        // Convert numbers properly
        if (
          field === "price" ||
          field === "originalPrice" ||
          field === "discount" ||
          field === "stock"
        ) {
          product[field] = parseInt(req.body[field], 10) || 0;
        } else {
          product[field] = req.body[field];
        }
      }
    });
    if (req.body.sizes) product.sizes = JSON.parse(req.body.sizes);
    if (req.body.colors) product.colors = JSON.parse(req.body.colors);
    if (req.body.tags) product.tags = JSON.parse(req.body.tags);

    if (req.files && req.files.length > 0) {
      product.images = req.files.map(
        (file) => `/uploads/products/${file.filename}`,
      );
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete product (Admin)
router.delete("/:id", auth, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await product.deleteOne();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

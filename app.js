const express = require("express");
const productRouter = require("./routes/productRoutes");
const userRouter = require("./routes/userRoutes");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");

const {
  protect,
  restrictTo,
  isAuthenticated,
} = require("./middleware/authMiddleware");
const Product = require("./models/productModel");

dotenv.config({ path: "./config.env" });

const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add the debugging route to list files in the public/images directory
app.get("/debug/images", (req, res) => {
  fs.readdir(path.join(__dirname, "public", "images"), (err, files) => {
    if (err) {
      return res.status(500).send("Error reading directory");
    }
    res.json(files);
  });
});

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful!"))
  .catch((err) => console.error("DB connection error:", err));

const port = 3000;

// Routes
app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/", isAuthenticated, async (req, res) => {
  try {
    const products = await Product.find();
    res.render("index", { items: products, user: req.user });
  } catch (err) {
    res.status(500).send("Error fetching items");
  }
});

app.get("/add-product", protect, restrictTo("manager"), (req, res) => {
  res.render("addProduct");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    status: "error",
    message: err.message,
  });
});

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

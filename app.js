const express = require("express");
const productRouter = require("./routes/productRoutes");
const userRouter = require("./routes/userRoutes");
const Item = require("./models/productModel");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { checkUser } = require("./middleware/authMiddleware");

dotenv.config({ path: "./config.env" });

const app = express();
app.use(cookieParser());
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.get("/", checkUser, async (req, res) => {
  try {
    const items = await Item.find();
    console.log("Fetched items:", items);
    res.render("index", { items, user: req.user });
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).send("Error fetching items");
  }
});

app.get("/add-product", checkUser, (req, res) => {
  if (!req.user || req.user.role !== "manager") {
    return res.redirect("/login");
  }
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

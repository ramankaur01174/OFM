const express = require("express");
const productController = require("./../controller/productController");
const upload = require("../utils/multerConfig");
const { protect, restrictTo } = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .get(productController.getAllProducts)
  .post(
    protect,
    restrictTo("manager"),
    upload.single("image"),
    productController.createProduct
  );

router
  .route("/:id")
  .get(productController.getProduct)
  .patch(protect, restrictTo("manager"), productController.updateProduct)
  .delete(protect, restrictTo("manager"), productController.deleteProduct);

router
  .route("/:id/increment")
  .patch(protect, restrictTo("manager"), productController.incrementQuantity);

router
  .route("/:id/decrement")
  .patch(protect, restrictTo("manager"), productController.decrementQuantity);

router.post(
  "/report",
  protect,
  restrictTo("manager"),
  productController.generateReport
);

router.post(
  "/:id/order",
  protect,
  restrictTo("user"),
  productController.orderProduct
);

module.exports = router;

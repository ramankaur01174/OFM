const Product = require("../models/productModel");
const sendEmail = require("../utils/email");
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      status: "success",
      results: products.length,
      data: {
        products,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const newProduct = await Product.create({
      productName: req.body.productName,
      lowStockLevel: req.body.lowStockLevel,
      imageUrl: req.file ? `/images/${req.file.filename}` : undefined,
    });

    res.status(201).json({
      status: "success",
      data: {
        product: newProduct,
      },
    });
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(400).json({
      status: "fail",
      message: err.message || "An error occurred while creating the product",
    });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err,
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }
    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.incrementQuantity = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    product.quantity += 1;
    await product.save();
    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.decrementQuantity = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product.quantity > 0) {
      product.quantity -= 1;
      await product.save();

      // Check if the quantity is below the low stock level
      if (product.quantity <= product.lowStockLevel) {
        await sendEmail({
          email: process.env.MANAGER_EMAIL,
          subject: "Low Stock Alert",
          message: `The stock for product ${product.productName} is low. Quantity: ${product.quantity}`,
        });
      }
    }

    res.status(200).json({
      status: "success",
      data: {
        product,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err,
    });
  }
};

exports.generateReport = async (req, res) => {
  try {
    const products = await Product.find();
    const report = products
      .map((product) => `${product.productName}: ${product.quantity}`)
      .join("\n");

    await sendEmail({
      email: process.env.MANAGER_EMAIL,
      subject: "Inventory Report",
      message: report,
    });

    res.status(200).json({
      status: "success",
      message: "Report generated and sent successfully.",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error generating report: " + err.message,
    });
  }
};

exports.downloadReport = async (req, res) => {
  try {
    const products = await Product.find();

    const reportData = products.map((product) => ({
      productName: product.productName,
      quantity: product.quantity,
    }));

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Product Report");

    worksheet.columns = [
      { header: "Product Name", key: "productName", width: 30 },
      { header: "Quantity", key: "quantity", width: 10 },
    ];

    worksheet.addRows(reportData);

    // Ensure the reports directory exists
    const reportsDir = path.join(__dirname, "..", "public", "reports");
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(reportsDir, "product_report.xlsx");
    await workbook.xlsx.writeFile(reportPath);
    console.log("Excel file written to:", reportPath);

    // Serve the file for download
    res.download(reportPath, "product_report.xlsx", (err) => {
      if (err) {
        console.error("Error downloading report:", err);
        res.status(500).json({
          status: "error",
          message: "Error downloading report: " + err.message,
        });
      } else {
        // Clean up the temporary file after sending
        fs.unlink(reportPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting temp file:", unlinkErr);
          }
        });
      }
    });
  } catch (err) {
    console.error("Error generating report:", err);
    res.status(500).json({
      status: "error",
      message: "Error generating report: " + err.message,
    });
  }
};

exports.orderProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: "fail",
        message: "Product not found",
      });
    }

    const orderQuantity = parseInt(req.body.quantity);

    if (orderQuantity > product.quantity) {
      return res.status(400).json({
        status: "fail",
        message: `Only ${product.quantity} items available. Please select a lesser quantity.`,
      });
    }

    product.quantity -= orderQuantity;
    await product.save();

    if (product.quantity <= product.lowStockLevel) {
      await sendEmail({
        email: process.env.MANAGER_EMAIL,
        subject: "Low Stock Alert",
        message: `The stock for product ${product.productName} is low. Quantity: ${product.quantity}`,
      });
    }

    await sendEmail({
      email: process.env.MANAGER_EMAIL,
      subject: "New Order",
      message: `An order has been placed for ${orderQuantity} of ${product.productName}. Remaining quantity: ${product.quantity}.`,
    });

    res.status(200).json({
      status: "success",
      message: "Order placed successfully.",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error placing order: " + err.message,
    });
  }
};

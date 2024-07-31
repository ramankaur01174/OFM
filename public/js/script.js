document
  .getElementById("logoutBtn")
  .addEventListener("click", async function () {
    try {
      const response = await fetch("/api/v1/users/logout", {
        method: "POST",
      });
      if (response.status === 200) {
        window.location.href = "/login";
      } else {
        alert("Logout failed.");
      }
    } catch (err) {
      console.error("Error logging out:", err);
    }
  });

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".decrement-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const id = this.dataset.id;
      updateQuantity(id, "decrement");
    });
  });

  document.querySelectorAll(".increment-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const id = this.dataset.id;
      updateQuantity(id, "increment");
    });
  });

  document.querySelectorAll(".order-btn").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      const id = this.dataset.id;
      const quantity = prompt("Enter quantity to order:");
      if (quantity && !isNaN(quantity) && quantity > 0) {
        orderProduct(id, quantity);
      } else {
        alert("Please enter a valid quantity.");
      }
    });
  });

  document
    .getElementById("addProductForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const formData = new FormData(this);
      try {
        const response = await fetch("/api/v1/products", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (data.status === "success") {
          alert("Product added successfully.");
          window.location.reload();
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error("Error adding product:", err);
      }
    });

  document
    .getElementById("updateProductForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const productId = document.getElementById("updateProductId").value;
      const productName = document.getElementById("updateProductName").value;
      const lowStockLevel = document.getElementById(
        "updateLowStockLevel"
      ).value;

      const updateData = {};
      if (productName) updateData.productName = productName;
      if (lowStockLevel) updateData.lowStockLevel = parseInt(lowStockLevel);

      try {
        const response = await fetch(`/api/v1/products/${productId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        });
        const data = await response.json();
        if (data.status === "success") {
          alert("Product updated successfully.");
          window.location.reload();
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error("Error updating product:", err);
      }
    });

  document
    .getElementById("deleteProductForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const productId = document.getElementById("deleteProductId").value;

      try {
        const response = await fetch(`/api/v1/products/${productId}`, {
          method: "DELETE",
        });
        if (response.status === 204) {
          alert("Product deleted successfully.");
          window.location.reload();
        } else {
          alert("Error deleting product.");
        }
      } catch (err) {
        console.error("Error deleting product:", err);
      }
    });

  async function updateQuantity(id, operation) {
    try {
      const response = await fetch(`/api/v1/products/${id}/${operation}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.status === "success") {
        const item = data.data.product;
        const quantityInput = document.querySelector(
          `.quantity-input[data-id="${item._id}"]`
        );
        quantityInput.value = item.quantity;
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  }

  async function orderProduct(id, quantity) {
    try {
      const response = await fetch(`/api/v1/products/${id}/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });
      const data = await response.json();
      if (data.status === "success") {
        alert("Order placed successfully.");
        window.location.reload();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error placing order:", err);
    }
  }
});

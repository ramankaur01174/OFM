document
  .getElementById("logoutBtn")
  .addEventListener("click", async function () {
    try {
      await fetch("/api/v1/users/logout", {
        method: "POST",
      });
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      window.location.href = "/login";
    } catch (err) {
      console.error("Error logging out:", err);
    }
  });

document.getElementById("reportBtn")?.addEventListener("click", async () => {
  try {
    const response = await fetch("/api/v1/products/report", {
      method: "POST",
    });
    const data = await response.json();
    if (data.status === "success") {
      alert("Report generated and sent successfully.");
      const downloadLink = document.getElementById("downloadLink");
      downloadLink.href = data.downloadUrl;
    } else {
      alert("Error generating report.");
    }
  } catch (err) {
    console.error("Error generating report:", err);
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

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async function (e) {
      e.stopPropagation();
      const id = this.dataset.id;
      try {
        const response = await fetch(`/api/v1/products/${id}`, {
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
  });

  document
    .getElementById("updateProductForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const productId = document.getElementById("updateProductId").value;
      const updateData = {
        productName: document.getElementById("updateProductName").value,
        lowStockLevel: document.getElementById("updateLowStockLevel").value,
      };
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

document
  .getElementById("downloadLink")
  ?.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/v1/products/download-report", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${document.cookie.split("jwt=")[1]}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "product_report.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        alert("Error downloading report.");
      }
    } catch (err) {
      console.error("Error downloading report:", err);
      alert("Error downloading report.");
    }
  });

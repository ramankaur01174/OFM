document.getElementById("logoutBtn").addEventListener("click", function () {
  document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "/login";
});

document.getElementById("reportBtn")?.addEventListener("click", async () => {
  try {
    const response = await fetch("/api/v1/products/report", {
      method: "POST",
    });
    if (response.status === 200) {
      alert("Report generated and sent successfully.");
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

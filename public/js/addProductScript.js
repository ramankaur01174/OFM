document
  .getElementById("addProductForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const formData = new FormData(this);

    try {
      const response = await fetch("/api/v1/products", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${document.cookie.split("jwt=")[1]}`,
        },
      });
      const result = await response.json();
      if (result.status === "success") {
        alert("Product added successfully!");
        window.location.reload();
      } else {
        console.error("Failed to add product:", result);
        alert("Failed to add product: " + JSON.stringify(result));
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product");
    }
  });

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch("/api/v1/users/checkRoles");

    if (!response.ok) {
      const errorMessage = await response.text();
      console.error("Error fetching roles:", errorMessage);
      return;
    }

    const data = await response.json();

    if (data.status === "success") {
      if (data.data.managerExists) {
        document.getElementById("managerOption").disabled = true;
      }
      if (data.data.adminExists) {
        document.getElementById("adminOption").disabled = true;
      }
    }
  } catch (err) {
    console.error("Failed to fetch roles:", err);
  }
});

document
  .getElementById("signupForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;
    const role = document.getElementById("role").value;

    try {
      const response = await fetch("/api/v1/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          passwordConfirm,
          role,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (data.status === "success") {
        window.location.href = "/";
      } else {
        alert("Signup failed: " + data.message);
      }
    } catch (err) {
      alert("Signup failed: " + err.message);
    }
  });

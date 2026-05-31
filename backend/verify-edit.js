const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function main() {
  const loginRes = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@zut.edu.zm", password: "admin123" }),
  });

  const loginData = await loginRes.json();
  console.log("login status", loginRes.status);
  console.log("token", loginData.token ? "present" : "missing");

  const updateRes = await fetch("http://localhost:5000/api/items/17", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${loginData.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: "Black Backpack",
      description: "Updated via verification",
      category: "bag",
      status: "found",
      location: "Library",
      date_lost_found: "2026-05-25",
    }),
  });

  const updateData = await updateRes.text();
  console.log("update status", updateRes.status);
  console.log("update body", updateData);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

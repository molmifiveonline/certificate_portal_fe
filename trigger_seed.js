fetch("http://localhost:8000/api/seed")
  .then((res) => res.json())
  .then((data) => console.log("Seed (new route):", data))
  .catch((err) => console.error(err));

fetch("http://localhost:8000/api/seed/seed")
  .then((res) => res.json())
  .then((data) => console.log("Seed (old route - before hot reload):", data))
  .catch((err) => console.error(err));

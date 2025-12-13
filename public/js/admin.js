async function loadToppers() {
  const res = await fetch("/admin/toppers");
  const toppers = await res.json();

  const container = document.getElementById("toppers-list");
  container.innerHTML = "";

  toppers.forEach((t) => {
    const div = document.createElement("div");
    div.className = "topper-card";
    div.innerHTML = `
      <img src="${t.photo}" alt="${t.name}" height="80" />
      <h3>${t.name}</h3>
      <p>Class: ${t.className}</p>
      <p>Subject: ${t.subject}</p>
      <p>Marks: ${t.marks}%</p>
      <p>Year: ${t.year}</p>
      <div style="display:flex; gap:8px; justify-content:center; margin-top:8px;">
        <form action="/admin/home/toppers/${t.featuredHome ? 'unfeature' : 'feature'}/${t._id}" method="POST">
          <button type="submit" class="btn-primary">${t.featuredHome ? 'Unfeature Home' : 'Feature Home'}</button>
        </form>
        <form action="/admin/delete/${t._id}" method="POST" onsubmit="return confirm('Delete this topper?')">
          <button type="submit" class="delete-btn">Delete</button>
        </form>
      </div>
    `;
    container.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", loadToppers);

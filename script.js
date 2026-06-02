let inventario = {};

document.addEventListener("DOMContentLoaded", async () => {
  await cargarInventario();

  document.querySelectorAll(".zone").forEach(zone => {
    zone.addEventListener("click", () => {
      const id = zone.dataset.id;
      mostrarInventario(id);
    });
  });
});

async function cargarInventario() {
  try {
    const response = await fetch("data/inventario.json");
    inventario = await response.json();
  } catch (error) {
    console.error("No fue posible cargar el inventario:", error);
    inventario = {};
  }
}

function mostrarInventario(id) {
  const data = inventario[id];

  if (!data) {
    document.getElementById("modalTitle").textContent = "Sin información";
    document.getElementById("modalResponsible").textContent = "";
    document.getElementById("inventoryContent").innerHTML =
      `<div class="empty">No existe inventario registrado para esta dependencia.</div>`;
    openModal();
    return;
  }

  document.getElementById("modalTitle").textContent = data.nombre || "Dependencia";
  document.getElementById("modalResponsible").textContent =
    "Responsable: " + (data.responsable || "Pendiente");

  const items = Array.isArray(data.items) ? data.items : [];

  if (!items.length) {
    document.getElementById("inventoryContent").innerHTML =
      `<div class="empty">No existen elementos registrados.</div>`;
    openModal();
    return;
  }

  document.getElementById("inventoryContent").innerHTML = items.map(item => `
    <div class="item-card">
      <strong>${escapeHtml(item.nombre || "Sin nombre")}</strong>
      <div>Cantidad: ${escapeHtml(item.cantidad || "-")}</div>
      <div>Estado: ${escapeHtml(item.estado || "-")}</div>
      <div>Observación: ${escapeHtml(item.observacion || "-")}</div>
    </div>
  `).join("");

  openModal();
}

function openModal() {
  document.getElementById("modalBackdrop").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modalBackdrop").classList.add("hidden");
}

function escapeHtml(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

let inventario = {};

document.addEventListener("DOMContentLoaded", async () => {
  await cargarInventario();
  crearZonasDesdeInventario();
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

function crearZonasDesdeInventario() {
  const mapWrapper = document.querySelector(".map-wrapper");

  if (!mapWrapper) return;

  // Elimina zonas antiguas creadas manualmente
  document.querySelectorAll(".zone").forEach(zone => zone.remove());

  Object.entries(inventario).forEach(([id, data]) => {
    if (
      data.x === undefined ||
      data.y === undefined ||
      data.w === undefined ||
      data.h === undefined
    ) {
      return;
    }

    const button = document.createElement("button");

    button.className = "zone";
    button.dataset.id = id;
    button.textContent = data.nombre || id;

    button.style.left = data.x + "%";
    button.style.top = data.y + "%";
    button.style.width = data.w + "%";
    button.style.height = data.h + "%";

    button.addEventListener("click", () => {
      mostrarInventario(id);
    });

    mapWrapper.appendChild(button);
  });
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

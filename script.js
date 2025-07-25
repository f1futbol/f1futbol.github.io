
let galeriaActual = [];
let imagenActual = 0;

// Abre imagen en modal
document.querySelectorAll(".galeria").forEach(galeria => {
  const imagenes = Array.from(galeria.querySelectorAll("img"));
  imagenes.forEach((img, index) => {
    img.addEventListener("click", () => {
      galeriaActual = imagenes;
      imagenActual = index;
      document.getElementById("modal-img").src = galeriaActual[imagenActual].src;
      document.getElementById("modal").style.display = "block";
    });
  });
});

function cerrarModal() {
  document.getElementById("modal").style.display = "none";
  document.getElementById("modal-img").src = "";
}

function cambiarImagen(direccion) {
  if (galeriaActual.length === 0) return;
  imagenActual = (imagenActual + direccion + galeriaActual.length) % galeriaActual.length;
  document.getElementById("modal-img").src = galeriaActual[imagenActual].src;
}

function toggleVersiones() {
  const submenu = document.getElementById("submenu-version");
  if (submenu) {
    submenu.classList.toggle("hidden");
  }
}

function filtrar(categoria) {
  const productos = document.querySelectorAll(".producto");
  const bienvenida = document.getElementById("bienvenida");
  const logoFixed = document.getElementById("logo-fixed");
  const medidas = document.getElementById("medidas");
  const submenu = document.getElementById("submenu-version");

  // Cierra el menú de versiones si está abierto
  if (submenu) submenu.classList.add("hidden");

  // Oculta o muestra productos según la categoría
  productos.forEach(p => {
    if (categoria === "ninguno" || categoria === "medidas") {
      p.classList.add("hidden");
    } else {
      p.classList.toggle("hidden", !p.classList.contains(categoria));
    }
  });

  if (categoria === "ninguno") {
    bienvenida.style.display = "block";
    logoFixed.style.display = "none";
    medidas.classList.add("hidden");
  } else if (categoria === "medidas") {
    bienvenida.style.display = "none";
    logoFixed.style.display = "block";
    medidas.classList.remove("hidden");
  } else {
    bienvenida.style.display = "none";
    logoFixed.style.display = "block";
    medidas.classList.add("hidden");
  }

  // Cierra el modal por si estaba abierto
  cerrarModal();
}

window.onload = () => {
  filtrar("ninguno");
};



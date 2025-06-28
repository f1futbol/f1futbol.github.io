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

    // Filtro por equipo
function filtrar(equipo) {
  const productos = document.querySelectorAll(".producto");
  const bienvenida = document.getElementById("bienvenida");
  const logoFixed = document.getElementById("logo-fixed");
  const titulo = document.getElementById("titulo");
  const medidas = document.getElementById("medidas");

  productos.forEach(p => {
    if (equipo === "todos") {
      p.classList.remove("hidden");
    } else if (equipo === "ninguno" || equipo === "medidas") {
      p.classList.add("hidden");
    } else {
      p.classList.toggle("hidden", !p.classList.contains(equipo));
    }
  });

  // Mostrar u ocultar bienvenida y logo
  if (equipo === "ninguno") {
    bienvenida.style.display = "block";
    logoFixed.style.display = "none";
    titulo.classList.remove("titulo-chico");
    medidas.classList.add("hidden");
  } else if (equipo === "medidas") {
    bienvenida.style.display = "none";
    logoFixed.style.display = "block";
    titulo.classList.add("titulo-chico");
    medidas.classList.remove("hidden");
  } else {
    bienvenida.style.display = "none";
    logoFixed.style.display = "block";
    titulo.classList.add("titulo-chico");
    medidas.classList.add("hidden");
    }
  }
  window.onload = () => {
    filtrar("ninguno");
  };
/* ==========================================================
   Estado de la reserva (demostrativo, sin backend)
   ========================================================== */
const reserva = {
  barbero: null,
  servicio: null,
  dia: 12,
  hora: null
};

/* Deja .active solo en el elemento indicado dentro de un grupo */
function activar(contenedor, selector, elemento) {
  contenedor.querySelectorAll(selector).forEach(n => n.classList.remove('active'));
  elemento.classList.add('active');
}

function mostrarToast(mensaje) {
  const toast = document.getElementById('toast');
  toast.textContent = mensaje;
  toast.classList.add('show');
  clearTimeout(mostrarToast.temporizador);
  mostrarToast.temporizador = setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ==========================================================
   Navegación entre pantallas
   ========================================================== */
function irA(idPantalla) {
  document.querySelectorAll('.screen').forEach(s => {
    s.classList.toggle('is-visible', s.id === idPantalla);
  });
  window.scrollTo({ top: 0 });
}

document.addEventListener('click', e => {
  const origen = e.target.closest('[data-go]');
  if (origen && !origen.disabled) irA(origen.dataset.go);
});

/* ==========================================================
   Pantalla 2: carrusel automático de barberos
   Se duplican las tarjetas para que el bucle sea continuo.
   ========================================================== */
const trackBarberos = document.getElementById('track-barberos');
const carrusel = document.getElementById('carrusel');
const siguienteBarbero = document.getElementById('siguiente-2');

[...trackBarberos.children].forEach(tarjeta => {
  trackBarberos.appendChild(tarjeta.cloneNode(true));
});

let posicionX = 0;
let pausadoPorHover = false;
const VELOCIDAD = 0.6; // píxeles por fotograma

function animarCarrusel() {
  const visible = document.getElementById('pantalla-2').classList.contains('is-visible');
  const pausado = pausadoPorHover || reserva.barbero !== null;

  // Distancia exacta de una serie completa de tarjetas
  const mitad = trackBarberos.children[3] ? trackBarberos.children[3].offsetLeft : 0;

  if (visible && !pausado && mitad > 0) {
    posicionX -= VELOCIDAD;
    if (-posicionX >= mitad) posicionX += mitad;
    trackBarberos.style.transform = `translateX(${posicionX}px)`;
  }
  requestAnimationFrame(animarCarrusel);
}

carrusel.addEventListener('mouseenter', () => { pausadoPorHover = true; });
carrusel.addEventListener('mouseleave', () => { pausadoPorHover = false; });

trackBarberos.addEventListener('click', e => {
  const tarjeta = e.target.closest('.barbero');
  if (!tarjeta) return;

  // Marca todas las copias de ese barbero como activas
  const id = tarjeta.dataset.id;
  trackBarberos.querySelectorAll('.barbero').forEach(n => {
    n.classList.toggle('active', n.dataset.id === id);
  });

  reserva.barbero = tarjeta.querySelector('h3').textContent;
  siguienteBarbero.disabled = false;
});

requestAnimationFrame(animarCarrusel);

/* ==========================================================
   Pantalla 3: selección de servicio (cuadrícula fija)
   ========================================================== */
const grid = document.querySelector('.grid-servicios');

grid.addEventListener('click', e => {
  const servicio = e.target.closest('.servicio');
  if (!servicio) return;
  activar(grid, '.servicio', servicio);
  reserva.servicio = servicio.querySelector('h3').textContent;
});

/* ==========================================================
   Pantalla 4: calendario de octubre 2026
   1 de octubre de 2026 es jueves. La semana empieza en lunes.
   ========================================================== */
const calendario = document.getElementById('calendario');
const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const DESPLAZAMIENTO = 3; // lunes = 0, jueves = 3
const DIAS_EN_MES = 31;

DIAS_SEMANA.forEach(letra => {
  const celda = document.createElement('div');
  celda.className = 'dow';
  celda.textContent = letra;
  calendario.appendChild(celda);
});

for (let i = 0; i < DESPLAZAMIENTO; i++) {
  const vacio = document.createElement('div');
  vacio.className = 'day blank';
  calendario.appendChild(vacio);
}

for (let dia = 1; dia <= DIAS_EN_MES; dia++) {
  const boton = document.createElement('button');
  boton.type = 'button';
  boton.className = 'day' + (dia === reserva.dia ? ' active' : '');
  boton.textContent = dia;
  boton.addEventListener('click', () => {
    activar(calendario, '.day', boton);
    reserva.dia = dia;
  });
  calendario.appendChild(boton);
}

/* ==========================================================
   Pantalla 4: horarios de 7:00 AM a 5:00 PM (bloques de una hora)
   ========================================================== */
const horarios = document.getElementById('horarios');

function formatearHora(hora24) {
  const sufijo = hora24 < 12 ? 'AM' : 'PM';
  const hora12 = ((hora24 + 11) % 12) + 1;
  return `${hora12}:00 ${sufijo}`;
}

for (let hora = 7; hora <= 17; hora++) {
  const slot = document.createElement('button');
  slot.type = 'button';
  slot.className = 'slot';
  slot.textContent = formatearHora(hora);
  horarios.appendChild(slot);
}

horarios.addEventListener('click', e => {
  const slot = e.target.closest('.slot');
  if (!slot) return;
  activar(horarios, '.slot', slot);
  reserva.hora = slot.textContent;
});

/* ==========================================================
   Confirmar reserva (demostrativo)
   ========================================================== */
document.getElementById('confirmar').addEventListener('click', () => {
  if (!reserva.hora) {
    mostrarToast('Selecciona una hora para continuar');
    return;
  }
  mostrarToast(
    `Reserva lista: ${reserva.barbero || 'Barbero'} · ${reserva.servicio || 'Servicio'} · ${reserva.dia} oct, ${reserva.hora}`
  );
});
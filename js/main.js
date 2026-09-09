/* Vida Dental Santiago - demo
   La Cueva del Oso · Francisco Velasquez · francisco.velasquez@lacuevadeloso.cl
   Sin dependencias. Abre como archivo local. */
(function () {
  'use strict';

  var sinMovimiento = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
  var haySoporteIO = 'IntersectionObserver' in window;

  /* ---- 1. Header compacto al bajar --------------------------------------
     Centinela invisible arriba del todo: cuando sale de pantalla, el header
     se compacta. Sin listener de scroll. */
  var header = document.getElementById('header');
  if (header && haySoporteIO) {
    var centinela = document.createElement('div');
    centinela.setAttribute('aria-hidden', 'true');
    centinela.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none';
    document.body.insertBefore(centinela, document.body.firstChild);

    new IntersectionObserver(function (entradas) {
      header.classList.toggle('compacto', !entradas[0].isIntersecting);
    }).observe(centinela);
  }

  /* ---- 2. Reveals al entrar en pantalla ---------------------------------- */
  var revelables = document.querySelectorAll('.reveal');
  if (!haySoporteIO || sinMovimiento) {
    for (var i = 0; i < revelables.length; i++) revelables[i].classList.add('visible');
  } else {
    var observadorReveal = new IntersectionObserver(function (entradas, obs) {
      var enTanda = 0;
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        entrada.target.style.transitionDelay = (enTanda * 80) + 'ms';
        entrada.target.classList.add('visible');
        enTanda++;
        obs.unobserve(entrada.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    for (var j = 0; j < revelables.length; j++) observadorReveal.observe(revelables[j]);
  }

  /* ---- 3. Contadores animados (4,8 y 221) -------------------------------- */
  function formatear(valor, decimales) {
    return decimales > 0
      ? valor.toFixed(decimales).replace('.', ',')
      : String(Math.round(valor));
  }

  function animarContador(nodo) {
    var destino = parseFloat(nodo.getAttribute('data-contador'));
    var decimales = parseInt(nodo.getAttribute('data-decimales'), 10) || 0;
    if (isNaN(destino)) return;

    if (sinMovimiento) {
      nodo.textContent = formatear(destino, decimales);
      return;
    }

    var duracion = 1200;
    var inicio = null;
    function paso(ahora) {
      if (inicio === null) inicio = ahora;
      var avance = Math.min((ahora - inicio) / duracion, 1);
      var suave = 1 - Math.pow(1 - avance, 3);
      nodo.textContent = formatear(destino * suave, decimales);
      if (avance < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }

  var contadores = document.querySelectorAll('[data-contador]');
  if (!haySoporteIO) {
    for (var k = 0; k < contadores.length; k++) {
      var n = contadores[k];
      n.textContent = formatear(
        parseFloat(n.getAttribute('data-contador')),
        parseInt(n.getAttribute('data-decimales'), 10) || 0
      );
    }
  } else {
    var observadorContador = new IntersectionObserver(function (entradas, obs) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        animarContador(entrada.target);
        obs.unobserve(entrada.target);
      });
    }, { threshold: 0.6 });
    for (var m = 0; m < contadores.length; m++) observadorContador.observe(contadores[m]);
  }

  /* ---- 4. Formulario de agendamiento ------------------------------------- */
  var TELEFONO = '56956276402';
  var form = document.getElementById('form-agenda');
  if (!form) return;

  var campoNombre = document.getElementById('nombre');
  var campoTratamiento = document.getElementById('tratamiento');
  var campoHorario = document.getElementById('horario');
  var errorNombre = document.getElementById('error-nombre');

  function limpiarError() {
    errorNombre.textContent = '';
    campoNombre.removeAttribute('aria-invalid');
  }

  function mostrarError(mensaje) {
    errorNombre.textContent = mensaje;
    campoNombre.setAttribute('aria-invalid', 'true');
    campoNombre.focus();
  }

  campoNombre.addEventListener('input', function () {
    if (errorNombre.textContent) limpiarError();
  });

  form.addEventListener('submit', function (evento) {
    evento.preventDefault();

    var nombre = campoNombre.value.trim().replace(/\s+/g, ' ');
    if (nombre === '') {
      mostrarError('Escribe tu nombre para que sepamos con quién hablamos.');
      return;
    }
    if (nombre.length < 2) {
      mostrarError('Ese nombre parece muy corto. Escríbelo completo, por favor.');
      return;
    }
    limpiarError();

    var tratamiento = campoTratamiento.value;
    var horario = campoHorario.value;
    var mensaje = 'Hola, soy ' + nombre + '. Quiero agendar una hora para ' +
                  tratamiento + '. Prefiero ' + horario + '.';

    window.open('https://wa.me/' + TELEFONO + '?text=' + encodeURIComponent(mensaje), '_blank', 'noopener');
  });
})();

(function () {
  var CONFIG = window.CONFIG || {};

  // ---- Vistas ----

  var viewLinks = document.querySelectorAll('.nav-link[data-view]');
  var views = document.querySelectorAll('.view');

  function showView(name) {
    for (var i = 0; i < views.length; i++) {
      views[i].classList.toggle('active', views[i].id === 'view-' + name);
    }
    for (var j = 0; j < viewLinks.length; j++) {
      viewLinks[j].classList.toggle('active', viewLinks[j].getAttribute('data-view') === name);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  for (var v = 0; v < viewLinks.length; v++) {
    viewLinks[v].addEventListener('click', function () {
      showView(this.getAttribute('data-view'));
    });
  }

  // ---- Contador ----

  var DAYS_EL = document.getElementById('days');
  var HOURS_EL = document.getElementById('hours');
  var MINUTES_EL = document.getElementById('minutes');
  var SECONDS_EL = document.getElementById('seconds');
  var TARGET_EL = document.getElementById('target-text');

  function getTarget() {
    var now = new Date();
    var year = now.getFullYear();
    var target = new Date(year, 9, 8, 0, 0, 0);
    if (now.getTime() >= target.getTime()) {
      target = new Date(year + 1, 9, 8, 0, 0, 0);
    }
    return target;
  }

  var target = getTarget();
  TARGET_EL.textContent = 'Hasta el 8 de octubre de ' + target.getFullYear();

  function isBirthdayNow() {
    var now = new Date();
    var start = new Date(now.getFullYear(), 9, 8, 0, 0, 0);
    var end = new Date(now.getFullYear(), 9, 9, 0, 0, 0);
    return now >= start && now < end;
  }

  function tick() {
    if (isBirthdayNow()) {
      launchConfetti();
      document.getElementById('countdown').innerHTML =
        '<p class="birthday-message">Hoy es tu día, mi amor. Felicidades.</p>';
      return;
    }
    var diff = target.getTime() - Date.now();
    var dayMs = 86400000;
    var days = Math.floor(diff / dayMs);
    var hours = Math.floor((diff % dayMs) / 3600000);
    var minutes = Math.floor((diff % 3600000) / 60000);
    var seconds = Math.floor((diff % 60000) / 1000);
    DAYS_EL.textContent = days;
    HOURS_EL.textContent = hours;
    MINUTES_EL.textContent = minutes;
    SECONDS_EL.textContent = seconds;
  }

  tick();
  setInterval(tick, 1000);

  // ---- Poesías ----

  var poems = window.POEMS || {};

  var MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];
  var MESES_TITULO = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function toKey(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function erase(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function friendly(key) {
    var p = key.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  var today = new Date();
  var todayKey = toKey(today);

  var winYear = target.getFullYear();
  var winStart = new Date(winYear, 8, 8, 0, 0, 0);
  var winEnd = new Date(winYear, 9, 8, 0, 0, 0);

  var dayEl = document.getElementById('poem-of-the-day');
  var currentKey = null;
  var typeTimer = null;

  function stopTyping() {
    if (typeTimer) {
      clearInterval(typeTimer);
      typeTimer = null;
    }
  }

  function renderPoem(text, dateLabel) {
    stopTyping();
    dayEl.innerHTML =
      '<p class="poem-date">' + erase(dateLabel) + '</p>' +
      '<p class="poem-text is-typing"></p>';

    var textEl = dayEl.querySelector('.poem-text');
    var len = text.length;
    var i = 0;

    function typeChar() {
      i = Math.min(i + 2, len);
      textEl.textContent = text.slice(0, i);
      if (i >= len) {
        stopTyping();
        textEl.classList.remove('is-typing');
      }
    }

    typeTimer = setInterval(typeChar, 24);
  }

  function showPoemFor(date) {
    var key = toKey(date);
    if (poems[key]) {
      currentKey = key;
      renderPoem(poems[key], friendly(key));
    } else {
      currentKey = null;
      stopTyping();
      if (key > todayKey) {
        dayEl.innerHTML =
          '<p class="placeholder">Espera mi amor a que sea el ' +
          date.getDate() + ' de ' + MESES[date.getMonth()] + '.</p>';
      } else {
        dayEl.innerHTML =
          '<p class="placeholder">Ese día todavía no escribí la poesía, mi amor.</p>';
      }
    }
  }

  function initPoemView() {
    if ((today >= winStart && today <= winEnd) || isBirthdayNow()) {
      if (poems[todayKey]) {
        currentKey = todayKey;
        renderPoem(poems[todayKey], 'Hoy, ' + friendly(todayKey));
      } else {
        currentKey = null;
        stopTyping();
        dayEl.innerHTML =
          '<p class="placeholder">Hoy todavía no escribí tu poesía... pero ya mismo la tengo lista, mi amor.</p>';
      }
    } else if (today < winStart) {
      dayEl.innerHTML =
        '<p class="placeholder">Muy pronto empezaré a regalarte una poesía cada día, mi amor.</p>';
    } else {
      var keys = Object.keys(poems).sort();
      var last = keys[keys.length - 1];
      if (last) {
        currentKey = last;
        renderPoem(poems[last], 'Mi última poesía, ' + friendly(last));
      } else {
        dayEl.innerHTML =
          '<p class="placeholder">Todas mis poesías ya te las regalé, mi amor.</p>';
      }
    }
  }

  initPoemView();

  // ---- Calendario ----

  var modal = document.getElementById('calendar-modal');
  var calGrid = document.getElementById('cal-grid');
  var calTitle = document.getElementById('cal-title');
  var calPrev = document.getElementById('cal-prev');
  var calNext = document.getElementById('cal-next');
  var selectedKey = null;

  var calStartMonth = winYear * 12 + 8;
  var calEndMonth = winYear * 12 + 9;
  var nowMonth = today.getFullYear() * 12 + today.getMonth();
  var calMonthIdx =
    nowMonth >= calStartMonth && nowMonth <= calEndMonth ? nowMonth : calStartMonth;

  function renderCalendar() {
    var y = Math.floor(calMonthIdx / 12);
    var m = calMonthIdx % 12;
    calTitle.textContent = MESES_TITULO[m] + ' ' + y;
    calPrev.disabled = calMonthIdx <= calStartMonth;
    calNext.disabled = calMonthIdx >= calEndMonth;

    var first = new Date(y, m, 1);
    var offset = (first.getDay() + 6) % 7;
    var daysInMonth = new Date(y, m + 1, 0).getDate();
    var cells = '';

    for (var i = 0; i < offset; i++) {
      cells += '<span class="cal-day empty"></span>';
    }

    for (var d = 1; d <= daysInMonth; d++) {
      var dayStart = new Date(y, m, d, 0, 0, 0);
      if (dayStart < winStart || dayStart > winEnd) {
        cells += '<span class="cal-day disabled">' + d + '</span>';
        continue;
      }
      var key = toKey(dayStart);
      var cls = 'cal-day selectable';
      if (poems[key]) cls += ' has-poem';
      if (key === todayKey) cls += ' today';
      if (key === selectedKey) cls += ' selected';
      cells += '<button class="' + cls + '" type="button" data-key="' + key + '">' + d + '</button>';
    }

    calGrid.innerHTML = cells;
  }

  calGrid.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn || !btn.dataset.key) return;
    var key = btn.dataset.key;
    selectedKey = key;
    var p = key.split('-');
    showPoemFor(new Date(+p[0], +p[1] - 1, +p[2]));
    renderCalendar();
    showView('poesia');
  });

  function openCalendar() {
    modal.classList.add('open');
    renderCalendar();
  }

  function closeCalendar() {
    modal.classList.remove('open');
  }

  document.getElementById('open-calendar').addEventListener('click', openCalendar);
  document.getElementById('close-calendar').addEventListener('click', closeCalendar);
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeCalendar();
  });

  calPrev.addEventListener('click', function () {
    calMonthIdx--;
    renderCalendar();
  });

  calNext.addEventListener('click', function () {
    calMonthIdx++;
    renderCalendar();
  });

  // ---- Galería ----

  var fotos = CONFIG.fotos || [];
  var gallery = document.getElementById('gallery');
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');

  if (!fotos.length) {
    gallery.innerHTML = '<p class="placeholder">Aquí iremos guardando nuestras fotos.</p>';
  } else {
    gallery.innerHTML = fotos
      .map(function (src, i) {
        return (
          '<div class="foto-item" data-src="' + erase(src) + '">' +
            '<img src="' + erase(src) + '" alt="Foto ' + (i + 1) + '" loading="lazy" onerror="this.parentNode.classList.add(\'sin-foto\')">' +
            '<div class="foto-placeholder">Aquí va una foto nuestra</div>' +
          '</div>'
        );
      })
      .join('');

    gallery.addEventListener('click', function (e) {
      var item = e.target.closest('.foto-item');
      if (!item || item.classList.contains('sin-foto')) return;
      lightboxImg.src = item.getAttribute('data-src');
      lightbox.classList.add('open');
    });
  }

  document.getElementById('lightbox-close').addEventListener('click', function () {
    lightbox.classList.remove('open');
  });

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) lightbox.classList.remove('open');
  });

  // ---- Cierre con Escape ----

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeCalendar();
      lightbox.classList.remove('open');
    }
  });

  // ---- Confeti (solo el día de su cumpleaños) ----

  var confettiLaunched = false;

  function launchConfetti() {
    if (confettiLaunched) return;
    confettiLaunched = true;
    var colors = ['#ff6b9d', '#8e6bff', '#ffc2d4', '#ffd166', '#fff7f9', '#ff8fa3'];
    for (var n = 0; n < 150; n++) {
      (function (n) {
        setTimeout(function () {
          var piece = document.createElement('div');
          piece.className = 'confetti';
          piece.style.left = Math.random() * 100 + 'vw';
          piece.style.background = colors[Math.floor(Math.random() * colors.length)];
          piece.style.width = (6 + Math.random() * 7) + 'px';
          piece.style.height = (10 + Math.random() * 8) + 'px';
          piece.style.animationDuration = (3 + Math.random() * 3) + 's';
          piece.style.animationDelay = (Math.random() * 1.5) + 's';
          document.body.appendChild(piece);
          setTimeout(function () {
            piece.remove();
          }, 9000);
        }, Math.random() * 2500);
      })(n);
    }
  }

  if (isBirthdayNow()) launchConfetti();

  // ---- Corazones flotantes ----

  function createHeart() {
    var container = document.getElementById('hearts');
    var heart = document.createElement('div');
    heart.className = 'fly-heart';
    heart.innerHTML =
      '<svg viewBox="0 0 32 29.6"><path d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"/></svg>';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDelay = (Math.random() * 8) + 's';
    heart.style.transform = 'scale(' + (0.6 + Math.random() * 0.9) + ')';
    container.appendChild(heart);
    setTimeout(function () {
      heart.remove();
    }, 12000);
  }

  setInterval(createHeart, 400);
  for (var i = 0; i < 8; i++) {
    setTimeout(createHeart, i * 180);
  }
})();
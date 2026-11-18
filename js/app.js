/* ABRIL MOYANO · PORTFOLIO — lógica de la página.
   El contenido se lee de la carpeta data/ (se edita desde el panel). No hace falta editar este archivo. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function esc(t) {
    return String(t == null ? "" : t).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var tagEj = '<span class="tag-ej">Ejemplo</span>';

  var toastT;
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove("show"); }, 4800);
  }


  /* ---------- CARGA DE CONTENIDOS (carpeta data/, editable desde el panel) ---------- */
  var DATA_FILES = ["portada", "sobre-mi", "fotos", "proyectos", "habilidades", "contacto"];
  function P(s) { return String(s == null ? "" : s).trim().replace(/^\/+/, ""); }          // ruta de imagen
  function isSample(src) { return /\.svg(\?|$)/i.test(src); }                              // las imágenes .svg son de ejemplo
  function arr(x) { return Array.isArray(x) ? x : []; }
  function parseVideo(u) {
    u = String(u || "").trim(); if (!u) return { plataforma: "youtube", id: "" };
    var m;
    if ((m = u.match(/vimeo\.com\/(?:video\/|.*\/)?(\d{6,})/))) return { plataforma: "vimeo", id: m[1] };
    if ((m = u.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{11})/))) return { plataforma: "youtube", id: m[1] };
    if (/^[\w-]{11}$/.test(u)) return { plataforma: "youtube", id: u };
    if (/^\d{6,}$/.test(u)) return { plataforma: "vimeo", id: u };
    return { plataforma: "youtube", id: "" };
  }
  function handle(u) {
    return String(u || "").trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/^@/, "").replace(/[\/?#].*$/, "");
  }
  function assemble(d) {
    var po = d["portada"] || {}, so = d["sobre-mi"] || {}, ha = d["habilidades"] || {}, co = d["contacto"] || {};
    var seen = {}, cats = [];
    var fotos = arr((d["fotos"] || {}).fotos).filter(function (f) { return f && f.src; }).map(function (f) {
      var c = String(f.categoria || "Fotos").trim(), k = c.toLowerCase();
      if (!seen[k]) { seen[k] = c; cats.push(c); }
      return { src: P(f.src), titulo: f.titulo || "", categoria: seen[k], lugar: f.lugar || "", meta: f.meta || "", ejemplo: isSample(f.src) };
    });
    return {
      email: co.email || "", instagram: handle(co.instagram), otrasRedes: arr(co.otrasRedes).filter(function (r) { return r && r.url; }),
      cvUrl: P(co.cv), formEndpoint: String(co.formEndpoint || "").trim(),
      frase: po.frase || "", subfrase: po.subfrase || "",
      portada: arr(po.imagenes).filter(function (p) { return p && p.src; }).map(function (p) { return { src: P(p.src), alt: p.alt || "Fotografía de Abril Moyano", ejemplo: isSample(p.src) }; }),
      roles: arr(po.roles).length ? po.roles : ["Fotografía"],
      sobreMi: { foto: P(so.foto), fotoAlt: so.fotoAlt || "Retrato de Abril Moyano", fotoEjemplo: isSample(so.foto || ""), cita: so.cita || "", parrafos: arr(so.parrafos), datos: arr(so.datos) },
      recorrido: arr(so.recorrido),
      categorias: cats, fotos: fotos,
      proyectos: arr((d["proyectos"] || {}).proyectos).filter(function (p) { return p && p.titulo; }).map(function (p) {
        return { titulo: p.titulo, tipo: p.tipo || "", anio: p.anio || "", rol: p.rol || "", resumen: p.resumen || "", descripcion: arr(p.descripcion),
          creditos: arr(p.creditos), herramientas: arr(p.herramientas), poster: P(p.poster), video: parseVideo(p.video), ejemplo: isSample(p.poster || "") };
      }),
      herramientas: arr(ha.herramientas).map(function (t) { return { sigla: t.sigla || String(t.nombre || "").slice(0, 2), nombre: t.nombre || "", nivel: Math.max(1, Math.min(5, +t.nivel || 3)), nota: t.nota || "" }; }),
      conocimientos: arr(ha.conocimientos)
    };
  }
  function showError() {
    var b = document.createElement("div");
    b.style.cssText = "margin:120px auto 40px;max-width:640px;padding:24px;border:1px solid rgba(247,244,255,.3);font-size:1rem;line-height:1.6";
    b.innerHTML = "<b>No se pudieron cargar los contenidos del portfolio.</b><br>Si abriste este archivo con doble clic desde tu computadora, el navegador bloquea la lectura de datos. " +
      "Publicá la carpeta en internet (mirá la guía paso a paso) y se verá completo.";
    $("#contenido").prepend(b);
  }
  Promise.all(DATA_FILES.map(function (n) {
    return fetch("data/" + n + ".json", { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error(n); return r.json(); });
  })).then(function (res) {
    var d = {}; DATA_FILES.forEach(function (n, i) { d[n] = res[i]; });
    init(assemble(d));
  }).catch(showError);

  function init(C) {
  /* ---------- PORTADA ---------- */
  $("#tagline").textContent = C.frase;
  $("#subtag").textContent = C.subfrase;
  var cls = ["s1", "s2", "s3"];
  $("#collage").innerHTML = C.portada.slice(0, 3).map(function (p, i) {
    return '<figure class="shot ' + cls[i] + '"><img src="' + esc(p.src) + '" alt="' + esc(p.alt) + '"' + (i ? '' : "") + '>' +
      (i === 0 ? '<div class="thirds"></div>' : "") +
      '<div class="vf"><span>f/1.8 · ISO 3200</span></div>' + (p.ejemplo ? tagEj : "") + "</figure>";
  }).join("");
  var roles = C.roles.map(function (r) { return "<span>" + esc(r) + "</span>"; }).join("");
  $("#marquee").innerHTML = roles + roles + roles + roles;

  // Timecode del visor
  var tc = $("#tc"), t0 = performance.now();
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function tick() {
    var ms = performance.now() - t0, f = Math.floor(ms / 40) % 25,
      s = Math.floor(ms / 1000) % 60, m = Math.floor(ms / 60000) % 60, h = Math.floor(ms / 3600000);
    tc.textContent = pad(h) + ":" + pad(m) + ":" + pad(s) + ":" + pad(f);
  }
  if (!reduce) setInterval(tick, 80);

  /* ---------- SOBRE MÍ ---------- */
  var S = C.sobreMi;
  $("#portrait").innerHTML = '<img src="' + esc(S.foto) + '" alt="' + esc(S.fotoAlt) + '">' + (S.fotoEjemplo ? tagEj : "");
  $("#pull").textContent = S.cita;
  $("#aboutText").innerHTML = S.parrafos.map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("");
  $("#facts").innerHTML = S.datos.map(function (d) { return "<div><dt>" + esc(d.etiqueta) + "</dt><dd>" + esc(d.valor) + "</dd></div>"; }).join("");

  /* ---------- GALERÍA ---------- */
  var cats = ["Todas"].concat(C.categorias);
  var current = "Todas", shown = [];
  $("#filters").innerHTML = cats.map(function (c) {
    return '<button class="chip-btn" type="button" data-c="' + esc(c) + '" aria-pressed="' + (c === current) + '">' + esc(c) + "</button>";
  }).join("");

  function renderGallery() {
    shown = C.fotos.filter(function (f) { return current === "Todas" || f.categoria === current; });
    $("#count").textContent = shown.length + (shown.length === 1 ? " fotografía" : " fotografías") + (current === "Todas" ? "" : " · " + current);
    $("#masonry").innerHTML = shown.map(function (f, i) {
      return '<button class="ph" type="button" data-i="' + i + '" style="animation-delay:' + Math.min(i * 60, 480) + 'ms" aria-label="Ampliar: ' + esc(f.titulo) + '">' +
        '<img src="' + esc(f.src) + '" alt="' + esc(f.titulo + ". " + (f.lugar || "")) + '" decoding="async">' +
        '<span class="ph-n">' + pad(i + 1) + "</span>" + (f.ejemplo ? tagEj : "") +
        '<span class="ph-cap"><b>' + esc(f.titulo) + "</b><span>" + esc(f.categoria) + (f.lugar ? " · " + esc(f.lugar) : "") + "</span></span></button>";
    }).join("");
  }
  renderGallery();
  $("#filters").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    current = b.dataset.c;
    $$(".chip-btn").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
    renderGallery();
  });

  /* ---------- OVERLAYS ---------- */
  var lastFocus = null;
  function openOverlay(el, focusEl) {
    lastFocus = document.activeElement;
    el.classList.add("open"); el.setAttribute("aria-hidden", "false");
    document.body.classList.add("lock");
    if (focusEl) focusEl.focus();
  }
  function closeOverlay(el) {
    el.classList.remove("open"); el.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lock");
    if (el.id === "pm") $("#pmMedia").innerHTML = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // Lightbox
  var lb = document.createElement("div");
  lb.className = "overlay lb"; lb.id = "lb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true"); lb.setAttribute("aria-label", "Visor de fotografías"); lb.setAttribute("aria-hidden", "true");
  lb.innerHTML = '<button class="x" type="button" aria-label="Cerrar">×</button>' +
    '<button class="nav-btn nav-prev" type="button" aria-label="Foto anterior">←</button>' +
    '<button class="nav-btn nav-next" type="button" aria-label="Foto siguiente">→</button>' +
    '<div class="lb-stage"><img class="lb-img" alt=""></div>' +
    '<div class="lb-cap"><div><b id="lbT"></b><div class="mono" id="lbS"></div></div><div class="mono" id="lbN"></div></div>';
  document.body.appendChild(lb);
  var li = 0;
  function showPhoto(i) {
    li = (i + shown.length) % shown.length;
    var f = shown[li], im = $(".lb-img", lb);
    im.style.animation = "none"; void im.offsetWidth; im.style.animation = "";
    im.src = f.src; im.alt = f.titulo;
    $("#lbT").textContent = f.titulo;
    $("#lbS").textContent = [f.categoria, f.lugar, f.meta].filter(Boolean).join(" · ") + (f.ejemplo ? " · IMAGEN DE EJEMPLO" : "");
    $("#lbN").textContent = pad(li + 1) + " / " + pad(shown.length);
    [1, -1].forEach(function (d) { var n = shown[(li + d + shown.length) % shown.length]; if (n) new Image().src = n.src; });
  }
  $("#masonry").addEventListener("click", function (e) {
    var b = e.target.closest(".ph"); if (!b) return;
    showPhoto(+b.dataset.i); openOverlay(lb, $(".x", lb));
  });
  $(".x", lb).onclick = function () { closeOverlay(lb); };
  $(".nav-prev", lb).onclick = function () { showPhoto(li - 1); };
  $(".nav-next", lb).onclick = function () { showPhoto(li + 1); };
  lb.addEventListener("click", function (e) { if (e.target === lb || e.target.classList.contains("lb-stage")) closeOverlay(lb); });
  var tx = null;
  lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (tx == null) return; var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) showPhoto(li + (dx < 0 ? 1 : -1));
  });

  /* ---------- PROYECTOS ---------- */
  $("#projGrid").innerHTML = C.proyectos.map(function (p, i) {
    return '<button class="proj" type="button" data-i="' + i + '" data-rv aria-label="Abrir proyecto: ' + esc(p.titulo) + '">' +
      '<div class="proj-media"><img src="' + esc(p.poster) + '" alt="Portada de ' + esc(p.titulo) + '">' + (p.ejemplo ? tagEj : "") + '<span class="play" aria-hidden="true"></span></div>' +
      '<div class="proj-info"><span class="proj-n">' + pad(i + 1) + "</span><h3>" + esc(p.titulo) + "</h3>" +
      '<span class="proj-meta mono">' + esc(p.tipo) + " · " + esc(p.anio) + " · " + esc(p.rol) + "</span>" +
      '<span class="proj-more">' + esc(p.resumen) + "</span></div></button>";
  }).join("");

  var pm = document.createElement("div");
  pm.className = "overlay pm"; pm.id = "pm"; pm.setAttribute("role", "dialog"); pm.setAttribute("aria-modal", "true"); pm.setAttribute("aria-label", "Ficha del proyecto"); pm.setAttribute("aria-hidden", "true");
  pm.innerHTML = '<button class="x" type="button" aria-label="Cerrar">×</button><div class="pm-card"><div><div class="pm-media" id="pmMedia"></div><div class="pm-note" id="pmNote"></div></div><div class="pm-body" id="pmBody"></div></div>';
  document.body.appendChild(pm);

  function videoUrls(v) {
    if (!v || !v.id) return null;
    if (v.plataforma === "vimeo") return { embed: "https://player.vimeo.com/video/" + encodeURIComponent(v.id) + "?autoplay=1", page: "https://vimeo.com/" + encodeURIComponent(v.id), name: "Vimeo" };
    return { embed: "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(v.id) + "?autoplay=1&rel=0", page: "https://www.youtube.com/watch?v=" + encodeURIComponent(v.id), name: "YouTube" };
  }
  function openProject(i) {
    var p = C.proyectos[i], v = videoUrls(p.video), media = $("#pmMedia"), note = $("#pmNote");
    media.innerHTML = '<img src="' + esc(p.poster) + '" alt="Portada de ' + esc(p.titulo) + '">' + (p.ejemplo ? tagEj : "") +
      (v ? '<button class="pm-play" type="button" aria-label="Reproducir video"><span class="play"></span></button>' : "");
    if (v) {
      note.innerHTML = '<span>Si el video no carga acá, </span><a href="' + v.page + '" target="_blank" rel="noopener">abrilo en ' + v.name + " ↗</a>";
      $(".pm-play", media).onclick = function () {
        media.innerHTML = '<iframe src="' + v.embed + '" title="' + esc(p.titulo) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
      };
    } else {
      note.innerHTML = "<span>Este proyecto todavía no tiene video. Pegá el enlace de YouTube o Vimeo en el panel de administración.</span>";
    }
    $("#pmBody").innerHTML = '<span class="mono">' + esc(p.tipo) + " · " + esc(p.anio) + "</span><h3>" + esc(p.titulo) + "</h3>" +
      '<span class="pm-role">Mi rol: ' + esc(p.rol) + "</span>" +
      p.descripcion.map(function (d) { return "<p>" + esc(d) + "</p>"; }).join("") +
      (p.creditos && p.creditos.length ? "<h4>Créditos</h4><ul>" + p.creditos.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + "</ul>" : "") +
      (p.herramientas && p.herramientas.length ? '<h4>Herramientas</h4><div class="tags">' + p.herramientas.map(function (h) { return "<span>" + esc(h) + "</span>"; }).join("") + "</div>" : "");
    pm.scrollTop = 0;
    openOverlay(pm, $(".x", pm));
  }
  $("#projGrid").addEventListener("click", function (e) {
    var b = e.target.closest(".proj"); if (b) openProject(+b.dataset.i);
  });
  $(".x", pm).onclick = function () { closeOverlay(pm); };
  pm.addEventListener("click", function (e) { if (e.target === pm) closeOverlay(pm); });

  document.addEventListener("keydown", function (e) {
    if (lb.classList.contains("open")) {
      if (e.key === "Escape") closeOverlay(lb);
      else if (e.key === "ArrowRight") showPhoto(li + 1);
      else if (e.key === "ArrowLeft") showPhoto(li - 1);
    } else if (pm.classList.contains("open") && e.key === "Escape") closeOverlay(pm);
  });

  /* ---------- HERRAMIENTAS Y RECORRIDO ---------- */
  $("#tools").innerHTML = C.herramientas.map(function (t) {
    var dots = ""; for (var i = 1; i <= 5; i++) dots += '<i class="' + (i <= t.nivel ? "on" : "") + '"></i>';
    return '<div class="tool"><div class="tool-sig" aria-hidden="true">' + esc(t.sigla) + "</div><div><h3>" + esc(t.nombre) + "</h3><p>" + esc(t.nota) +
      '</p><div class="meter" role="img" aria-label="Nivel ' + t.nivel + ' de 5">' + dots + "</div></div></div>";
  }).join("");
  $("#chips").innerHTML = C.conocimientos.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("");
  $("#timeline").innerHTML = C.recorrido.map(function (r) {
    return '<li class="' + (r.ejemplo ? "ej" : "") + '"><span class="mono">' + esc(r.cuando) + "</span><h4>" + esc(r.titulo) + '</h4><div class="where">' + esc(r.lugar) + "</div><p>" + esc(r.texto) + "</p></li>";
  }).join("");

  /* ---------- CONTACTO ---------- */
  var ig = String(C.instagram).replace(/^@/, "");
  $("#igLink").href = "https://www.instagram.com/" + encodeURIComponent(ig) + "/";
  $("#igText").textContent = "@" + ig;
  $("#mailText").textContent = C.email;
  $("#socials").innerHTML = C.otrasRedes.map(function (r) { return '<li><a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.nombre) + " ↗</a></li>"; }).join("");
  $("#copyMail").onclick = function () { copy(C.email, "Email copiado."); };
  $("#year").textContent = new Date().getFullYear();

  function copy(text, ok) {
    try { navigator.clipboard.writeText(text).then(function () { toast(ok); }, function () { toast("Copialo a mano: " + text); }); }
    catch (e) { toast("Copialo a mano: " + text); }
  }

  // Botones de CV
  $$("[data-cv]").forEach(function (a) {
    if (C.cvUrl) { a.href = C.cvUrl; a.setAttribute("download", ""); a.setAttribute("target", "_blank"); }
    else a.addEventListener("click", function (e) {
      if (a.classList.contains("nav-cv")) return; // en la barra solo lleva a contacto
      e.preventDefault();
      toast("Todavía no cargaste tu CV. Subilo desde el panel, en la sección Contacto y redes.");
    });
  });
  if (C.cvUrl) { var nc = $(".nav-cv"); nc.href = C.cvUrl; }

  // Formulario
  var form = $("#form"), msg = $("#formMsg");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var n = $("#f-nombre"), m = $("#f-email"), t = $("#f-msg"), ok = true;
    [n, m, t].forEach(function (x) { x.classList.remove("bad"); if (!x.value.trim()) { x.classList.add("bad"); ok = false; } });
    if (ok && !/^\S+@\S+\.\S+$/.test(m.value.trim())) { m.classList.add("bad"); ok = false; }
    if (!ok) { msg.textContent = "Completá nombre, un email válido y tu mensaje."; return; }
    var tipo = $("#f-tipo").value, body = t.value.trim() + "\n\n— " + n.value.trim() + " (" + m.value.trim() + ")";
    if (C.formEndpoint) {
      msg.textContent = "Enviando…";
      fetch(C.formEndpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ nombre: n.value, email: m.value, tipo: tipo, mensaje: t.value }) })
        .then(function (r) { if (!r.ok) throw 0; msg.textContent = "¡Mensaje enviado! Gracias por escribirme."; form.reset(); })
        .catch(function () { msg.textContent = "No se pudo enviar. Escribime directamente a " + C.email; });
    } else {
      var url = "mailto:" + C.email + "?subject=" + encodeURIComponent("Portfolio · " + tipo) + "&body=" + encodeURIComponent(body);
      msg.innerHTML = 'Se abrirá tu correo con el mensaje armado. Si no pasa nada, <button class="link-btn" type="button" id="cpMsg">copiá el mensaje</button> y envialo a ' + esc(C.email) + ".";
      $("#cpMsg").onclick = function () { copy(body, "Mensaje copiado."); };
      try { window.location.href = url; } catch (err) { /* sin cliente de correo */ }
    }
  });

  /* ---------- NAVEGACIÓN ---------- */
  var nav = $("#nav"), burger = $("#burger");
  function setMenu(open) {
    nav.classList.toggle("open", open); burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("lock", open);
  }
  burger.onclick = function () { setMenu(!nav.classList.contains("open")); };
  $$("#navLinks a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });

  var bar = $("#progress");
  function onScroll() {
    nav.classList.toggle("solid", window.scrollY > 30);
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  var links = $$("#navLinks a");
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (en.isIntersecting) links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("header[id],section[id]").forEach(function (s) { spy.observe(s); });

    // Aparición suave al hacer scroll (solo para lo que está fuera de pantalla)
    if (!reduce) {
      var rv = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.remove("rv-hide"); rv.unobserve(en.target); } });
      }, { threshold: 0.08 });
      $$("[data-rv]").forEach(function (el, i) {
        if (el.getBoundingClientRect().top > innerHeight * 0.95) { el.classList.add("rv-hide"); rv.observe(el); }
      });
      setTimeout(function () { $$(".rv-hide").forEach(function (el) { el.classList.remove("rv-hide"); }); }, 6000);
    }
  }
  }
})();

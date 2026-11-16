(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasG = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  if (hasG) gsap.registerPlugin(ScrollTrigger);
  var $ = function(s, c){ return Array.prototype.slice.call((c||document).querySelectorAll(s)); };

  /* ---- barra de progresso + navegação ativa ---- */
  var bar = document.getElementById('progress');
  var navs = $('[data-nav]'), terrs = $('[data-terr]');
  var subs = $('[data-sub]'), blocks = $('[data-block]');
  function onScroll(){
    var h = document.documentElement, max = h.scrollHeight - h.clientHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, h.scrollTop / max) : 0) + ')';
    var y = window.innerHeight * 0.35, cur = '', sub = '';
    terrs.forEach(function(t){ var r = t.getBoundingClientRect(); if (r.top <= y && r.bottom > y) cur = t.dataset.terr; });
    navs.forEach(function(a){ if (a.dataset.nav === cur) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current'); });
    blocks.forEach(function(b){ var r = b.getBoundingClientRect(); if (r.top <= y + 40 && r.bottom > y) sub = b.id; });
    subs.forEach(function(a){ if (a.dataset.sub === sub) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current'); });
  }
  var tick = false;
  window.addEventListener('scroll', function(){ if (!tick){ tick = true; requestAnimationFrame(function(){ onScroll(); tick = false; }); } }, {passive:true});
  onScroll();

  /* ---- Hero: rede de dados em canvas, dirigida por GSAP ---- */
  var cv = document.getElementById('net'), ctx = cv.getContext('2d'), hero = cv.parentElement, viz = document.getElementById('viz');
  var W = 0, H = 0, dpr = 1, pts = [], state = { draw: reduce || !hasG ? 1 : 0, pulse: 0 }, running = true;
  var line = [[.04,.82],[.17,.7],[.3,.62],[.44,.69],[.58,.52],[.72,.4],[.84,.3],[.93,.18]], marks = [2,5,7];
  function size(){
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    var n = Math.round(Math.min(90, Math.max(28, W * H / 16000)));
    pts = [];
    for (var i = 0; i < n; i++) pts.push({ x: Math.random()*W, y: Math.random()*H, vx:(Math.random()-.5)*.22, vy:(Math.random()-.5)*.22, r: Math.random()*1.5+.6 });
  }
  function frame(t){
    ctx.clearRect(0,0,W,H);
    var i, j, a, b, d, lim = 150;
    for (i = 0; i < pts.length; i++){
      a = pts[i];
      if (!reduce){ a.x += a.vx; a.y += a.vy; if (a.x < 0 || a.x > W) a.vx *= -1; if (a.y < 0 || a.y > H) a.vy *= -1; }
      for (j = i + 1; j < pts.length; j++){
        b = pts[j]; d = Math.hypot(a.x-b.x, a.y-b.y);
        if (d < lim){ ctx.strokeStyle = 'rgba(193,244,28,' + (0.16*(1-d/lim)).toFixed(3) + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
      }
      ctx.fillStyle = 'rgba(226,228,208,.55)'; ctx.beginPath(); ctx.arc(a.x,a.y,a.r,0,6.283); ctx.fill();
    }
    /* linha de tendência sobre a área do gráfico */
    if (viz && viz.offsetParent !== null){
      var hr = hero.getBoundingClientRect(), vr = viz.getBoundingClientRect();
      var ox = vr.left - hr.left, oy = vr.top - hr.top, P = line.map(function(p){ return [ox + p[0]*vr.width, oy + p[1]*vr.height]; });
      var total = P.length - 1, prog = state.draw * total, k, seg;
      ctx.lineWidth = 2.2; ctx.strokeStyle = '#c1f41c'; ctx.lineJoin = 'round'; ctx.shadowColor = 'rgba(193,244,28,.7)'; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
      for (k = 1; k <= total; k++){
        seg = Math.min(1, Math.max(0, prog - (k-1))); if (seg <= 0) break;
        ctx.lineTo(P[k-1][0] + (P[k][0]-P[k-1][0])*seg, P[k-1][1] + (P[k][1]-P[k-1][1])*seg);
      }
      ctx.stroke(); ctx.shadowBlur = 0;
      /* colunas de dados sob a linha */
      for (k = 0; k <= total; k++){
        if (prog < k) break;
        ctx.strokeStyle = 'rgba(193,244,28,.22)'; ctx.lineWidth = 1; ctx.setLineDash([3,5]);
        ctx.beginPath(); ctx.moveTo(P[k][0], P[k][1]); ctx.lineTo(P[k][0], oy + vr.height); ctx.stroke(); ctx.setLineDash([]);
        var big = marks.indexOf(k) > -1, pr = big ? 5.5 : 3;
        if (big){ var w = (Math.sin((t||0)/600 + k) + 1)/2; ctx.fillStyle = 'rgba(193,244,28,' + (0.12 + 0.14*w).toFixed(3) + ')'; ctx.beginPath(); ctx.arc(P[k][0],P[k][1], 12 + 6*w, 0, 6.283); ctx.fill(); }
        ctx.fillStyle = big ? '#c1f41c' : '#e2e4d0'; ctx.beginPath(); ctx.arc(P[k][0],P[k][1],pr,0,6.283); ctx.fill();
      }
    }
    if (running && !reduce) requestAnimationFrame(frame);
  }
  size(); requestAnimationFrame(frame);
  var rz; window.addEventListener('resize', function(){ clearTimeout(rz); rz = setTimeout(function(){ size(); if (reduce || !running) frame(0); }, 150); });
  if ('IntersectionObserver' in window){
    new IntersectionObserver(function(e){ var on = e[0].isIntersecting; if (on && !running){ running = true; requestAnimationFrame(frame); } else if (!on) running = false; }).observe(hero);
  }

  if (!hasG || reduce) return;

  /* ---- sequência de entrada da Hero ---- */
  var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.hero-bg', { scale: 1.16, duration: 2.4, ease: 'power2.out' }, 0)
    .from('.hero-head [data-in]', { y: 28, opacity: 0, duration: .9, stagger: .12 }, .15)
    .to(state, { draw: 1, duration: 2.2, ease: 'power2.inOut' }, .5)
    .from('.tag', { opacity: 0, scale: .85, duration: .5, stagger: .32, ease: 'back.out(1.8)' }, 1.15)
    .from('.doors [data-in]', { y: 36, opacity: 0, duration: .9, stagger: .14 }, .8);
  gsap.to('.hero-bg', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---- micro-animações ao rolar (partem de um estado legível) ---- */
  $('[data-rv]').forEach(function(el){
    gsap.from(el, { y: 22, opacity: .35, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
  $('.block-n').forEach(function(el){
    gsap.from(el, { xPercent: -40, opacity: .2, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });
  gsap.from('#convLines', { clipPath: 'inset(0 100% 0 0)', duration: 1.3, ease: 'power2.inOut', scrollTrigger: { trigger: '#convLines', start: 'top 75%', once: true } });
  gsap.from('.conv-node', { scale: .9, duration: .7, delay: .9, ease: 'back.out(2)', scrollTrigger: { trigger: '#convLines', start: 'top 75%', once: true } });
  $('[data-bar]').forEach(function(el, i){
    gsap.from(el, { scaleX: 0, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
  $('.split div').forEach(function(el){
    gsap.from(el, { scaleX: .2, transformOrigin: '0 50%', duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
  $('[data-count]').forEach(function(el){
    var end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10), o = { v: 0 };
    var fmt = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    var fin = el.textContent;
    gsap.to(o, { v: end, duration: 1.4, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      onUpdate: function(){ el.textContent = fmt.format(o.v); }, onComplete: function(){ el.textContent = fin; } });
  });
  gsap.from('#path span', { y: 14, opacity: .3, duration: .5, stagger: .12, ease: 'power2.out', scrollTrigger: { trigger: '#path', start: 'top 88%', once: true } });
  gsap.from('.pr-hero em', { backgroundSize: '0% 100%', duration: .9, stagger: .25, ease: 'power2.out', scrollTrigger: { trigger: '.pr-hero', start: 'top 80%', once: true } });
  gsap.from('.steps li', { x: 24, opacity: .3, duration: .6, stagger: .15, ease: 'power2.out', scrollTrigger: { trigger: '.steps', start: 'top 85%', once: true } });
})();

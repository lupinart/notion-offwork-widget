(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const root = document.documentElement;
  let config;
  try {
    config = OffworkTimer.readConfig(OFFWORK_CONFIG,new URLSearchParams(location.search));
  } catch (error) {
    document.querySelector('svg').setAttribute('hidden','');
    $('accessible-progress').hidden = true;
    $('error').textContent = `設定需要調整：${error.message}`;
    $('error').hidden = false;
    return;
  }
  root.dataset.theme = config.theme;
  const colors = config.colors;
  for (const [name, value] of [['--blue-600',colors.lightAccent],['--blue-200',colors.darkAccent],['--mist-50',colors.lightSurface],['--slate-900',colors.darkSurface]]) root.style.setProperty(name,value);
  if (config.accent) root.style.setProperty('--custom-accent',config.accent);
  $('start').textContent = config.start;
  $('end').textContent = config.end;
  $('accessible-progress').setAttribute('aria-label',config.text.progressLabel);

  function fit(id, text, width, maxSize) {
    const el = $(id);
    el.textContent = text;
    el.style.fontSize = `${maxSize}px`;
    const measured = el.getComputedTextLength();
    if (measured > width) el.style.fontSize = `${maxSize*width/measured}px`;
  }

  function update() {
    const s = OffworkTimer.stateAt(new Date(),config);
    document.body.dataset.state = s.kind;
    const resting = s.kind === 'off' || s.kind === 'rest';
    $('clock').toggleAttribute('hidden',resting);
    $('coffee').toggleAttribute('hidden',!resting);
    $('countdown').toggleAttribute('hidden',resting);
    $('rest').toggleAttribute('hidden',!resting);
    $('progress-area').toggleAttribute('hidden',resting);
    $('accessible-progress').hidden = resting;
    const t = config.text;
    const prefix = s.kind === 'working' ? 'working' : s.kind;
    fit('heading',t[`${prefix}Title`],258,30);
    fit('status',`${s.weekday} · ${t[`${prefix}Status`]}`,258,24);
    if (resting) {
      fit('rest-main',t[`${prefix}Main`],384,84);
      fit('rest-note',t[`${prefix}Note`],384,26);
      $('card-desc').textContent = `${s.weekday}，${t[`${prefix}Main`]}。${t[`${prefix}Note`]}。`;
    } else {
      const hours = Math.floor(s.remaining/3600), minutes = Math.floor(s.remaining%3600/60), seconds = s.remaining%60;
      $('hours').textContent = hours;
      $('remainder').textContent = `${String(minutes).padStart(2,'0')} 分 ${String(seconds).padStart(2,'0')} 秒`;
      const percent = Math.floor(s.progress*100);
      $('fill-clip').setAttribute('width',352*s.progress);
      $('percent').textContent = `${percent}%`;
      $('accessible-progress').setAttribute('aria-valuenow',percent);
      $('hour-hand').setAttribute('transform',`rotate(${s.hour%12*30+s.minute/2} 132 122)`);
      $('minute-hand').setAttribute('transform',`rotate(${s.minute*6+s.second/10} 132 122)`);
      $('second-hand').setAttribute('transform',`rotate(${s.second*6} 132 122)`);
      $('card-desc').textContent = `${s.weekday}，${t[`${prefix}Title`]}${hours}小時${minutes}分${seconds}秒，今日上班進度${percent}%。`;
    }
  }
  let visible = true;
  function sync() {
    const paused = document.hidden || !visible;
    document.body.dataset.paused = String(paused);
    if (!paused) update();
  }
  update();
  setInterval(() => {if (!document.hidden && visible) update();},1000);
  document.addEventListener('visibilitychange',sync);
  window.addEventListener('pageshow',sync);
  new IntersectionObserver(entries => {visible = entries[0].isIntersecting;sync();}).observe($('card'));
})(globalThis);

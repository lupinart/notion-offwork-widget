(function (root) {
  'use strict';
  const weekdays = ['週日','週一','週二','週三','週四','週五','週六'];
  const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const hex = /^#[0-9a-f]{6}$/i;

  function minutes(value) {
    if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error('時間請使用00:00–23:59，例如08:00。');
    const [hour, minute] = value.split(':').map(Number);
    return hour*60+minute;
  }

  function readConfig(base, params) {
    const start = params.get('start') ?? base.start;
    const end = params.get('end') ?? base.end;
    const startMinutes = minutes(start), endMinutes = minutes(end);
    if (endMinutes <= startMinutes) throw new Error('下班時間需要晚於上班時間；目前支援同一天的班表。');
    let workdays = base.workdays;
    if (params.has('days')) {
      if (!/^[0-6](,[0-6])*$/.test(params.get('days'))) throw new Error('工作日請用0–6並以逗號分開，例如1,2,3,4,5。');
      workdays = [...new Set(params.get('days').split(',').map(Number))];
    }
    if (!Array.isArray(workdays) || !workdays.length || workdays.some(d => !Number.isInteger(d) || d<0 || d>6)) {
      throw new Error('請設定至少一個有效工作日。');
    }
    const theme = params.get('theme') ?? base.theme;
    if (!['auto','light','dark'].includes(theme)) throw new Error('主題請使用auto、light或dark。');
    const timezone = params.get('timezone') ?? base.timezone;
    if (typeof timezone !== 'string' || !timezone.trim()) throw new Error('請設定有效時區，例如Asia/Taipei。');
    let formatter;
    try {
      formatter = new Intl.DateTimeFormat('en-US', {timeZone:timezone, weekday:'short', hour:'2-digit', minute:'2-digit', second:'2-digit', hourCycle:'h23'});
    } catch {throw new Error('時區無法辨識，例如台灣請使用Asia/Taipei。');}
    let accent = params.get('accent');
    if (accent !== null) {
      accent = accent.startsWith('#') ? accent : `#${accent}`;
      if (!hex.test(accent)) throw new Error('主色請使用六位色碼，例如337ea9。');
    }
    for (const key of ['lightAccent','darkAccent','lightSurface','darkSurface']) {
      if (!hex.test(base.colors?.[key])) throw new Error(`配色${key}需使用#加六位色碼。`);
    }
    for (const key of ['workingTitle','workingStatus','beforeTitle','beforeStatus','offTitle','offStatus','offMain','offNote','restTitle','restStatus','restMain','restNote','progressLabel']) {
      const value = base.text?.[key];
      if (typeof value !== 'string' || !value.trim() || [...value].length>24) throw new Error(`文案${key}請使用1–24個字。`);
    }
    return {...base, start, end, startMinutes, endMinutes, workdays, theme, timezone, formatter, accent};
  }

  function stateAt(date, config) {
    const p = Object.fromEntries(config.formatter.formatToParts(date).map(v => [v.type,v.value]));
    const day = names.indexOf(p.weekday);
    const hour = Number(p.hour), minute = Number(p.minute), second = Number(p.second);
    const now = hour*3600+minute*60+second;
    const start = config.startMinutes*60, end = config.endMinutes*60;
    let kind = 'working', remaining = Math.max(0,end-now), progress = (now-start)/(end-start);
    if (!config.workdays.includes(day)) {kind = 'rest'; remaining = 0; progress = null;}
    else if (now < start) {kind = 'before'; remaining = start-now; progress = 0;}
    else if (now >= end) {kind = 'off'; remaining = 0; progress = 1;}
    return {kind, remaining, progress, weekday:weekdays[day], hour, minute, second};
  }

  const api = {readConfig, stateAt};
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.OffworkTimer = api;
})(globalThis);

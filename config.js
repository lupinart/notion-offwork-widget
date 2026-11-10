// 之後要改時間、文案或配色，集中改這裡即可；不需改版面程式。
globalThis.OFFWORK_CONFIG = {
  timezone: 'Asia/Taipei',
  start: '08:00',
  end: '17:00',
  workdays: [1, 2, 3, 4, 5], // 0週日、1週一 … 6週六
  theme: 'auto',
  colors: {
    lightAccent: '#4c7dff', darkAccent: '#9ab5ff',
    lightSurface: '#f5f8ff', darkSurface: '#242d3d',
  },
  text: {
    workingTitle: '距離下班還有', workingStatus: '努力上班中',
    beforeTitle: '距離上班還有', beforeStatus: '慢慢準備就好',
    offTitle: '今天辛苦了', offStatus: '下班啦', offMain: '下班啦',
    offNote: '把時間留給自己',
    restTitle: '今天休息', restStatus: '好好充電', restMain: '好好休息',
    restNote: '今天不趕時間，慢慢來',
    progressLabel: '今日上班進度',
  },
};

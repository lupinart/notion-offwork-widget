# 繁體下班倒數

原生HTML＋SVG＋JavaScript，無套件、後端、外部圖片、遠端字型或追蹤。

- Notion嵌入網址：https://lupinart.github.io/notion-offwork-widget/
- 原始碼：https://github.com/lupinart/notion-offwork-widget

在Notion使用「嵌入」並貼上HTTPS網址；建議寬高各280–360px，卡片保持1:1等比例。容器不是正方形時，多餘空間透明，不拉扁內容。也可以直接開啟本機index.html，旁邊JS／CSS檔案需一起保留；以傳統script載入，因此file網址也可預覽。

預設Asia/Taipei、週一到週五、08:00–17:00。計算的是整段上班時間，不扣午休，不自動辨識國定假日、請假或補班；目前僅支援同一天的班表。

- 上班前：倒數到上班時間，進度0%。
- 上班中：即時下班倒數（小時／分／秒），顯示今日上班進度與當地時間指針。
- 下班後：咖啡杯與「下班啦」。
- 非工作日：咖啡杯與「好好休息」。

外圍透明；卡片自動跟隨明暗。2026-11-11起與待辦預覽頁統一為中性灰底、細邊框、小圓角、系統字體與淺藍色點綴，外圍留白16px。系統選擇減少動態時，停止蒸氣與裝飾秒針；計時數字仍更新。頁面隱藏或卡片離開可視區域時暫停更新與裝飾動畫，恢復後以現在時間重新計算，不會累積計時誤差。此為HTML嵌入工具，不適合當Notion封面／圖示圖片；未操作個人Notion畫面。

## 之後怎麼調整

設定集中在config.js：時間、工作日、時區、明暗、淺／深色主色與卡片底色，以及所有中文文案。預設不顯示設定按鈕、不建立帳號、不使用localStorage。網址參數只影響這次開啟的版本，重新開啟同一網址即可保留設定。

可在網址後加：

```text
?start=09:00&end=18:00&days=1,2,3,4,5&accent=337ea9&theme=auto
```

| 參數 | 用法 |
|---|---|
| start / end | 24小時制，例如09:00、18:00；下班需晚於上班 |
| days | 0週日、1週一到6週六，逗號分開 |
| timezone | 例如Asia/Taipei、America/New_York |
| theme | auto／light／dark |
| accent | 六位色碼，例如337ea9；會同時覆蓋明暗主色 |

文案可直接改config.js的text；每個欄位必填，最多24個字，主標題建議短一些。過長文字會縮小以保留卡片範圍；都以textContent寫入，不解析HTML。錯誤時間、時區、色碼或漏填文案會顯示設定錯誤，不會默默改用其他值。配色可在config.js分別調整淺／深模式，進一步版面與字級見DESIGN.md。

## 驗證

依工作區規則，複製來源至/private/tmp/codex-builds/再執行測試；不得在iCloud來源資料夾執行QA。

```sh
node test-timer.mjs
```

獨立瀏覽器測試需既有Playwright與Chromium，以環境變數PLAYWRIGHT_MODULE與CHROMIUM_PATH指定後執行node test-widget.mjs。測試涵蓋秒數、08／17時段邊界、週末、跨日、不同時區／DST、網址與漏填設定、明暗iframe透明、200–512px及減少動態。

## 參考

使用者提供的下班倒數外觀與狀態概念：
https://swg.notion.pet/s/ae4309086af27ba200458b4342648487

本版獨立實作計時、圖形與樣式，改為繁體中文與瀏覽器即時計算，不呼叫或重新託管原站API。保留時鐘與進度條概念；休息狀態改用自行繪製咖啡杯。現行視覺依Lupin指定，對齊https://lupinart.github.io/notion-clock-calendar/todo-preview.html?v=1。

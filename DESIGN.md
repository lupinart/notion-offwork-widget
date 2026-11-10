# 下班倒數的設計規範

方向：淡藍圓角卡片、深色粗體數字，平時以時計與進度為主；下班與休息日換咖啡杯。外圍透明，卡片底色保留。沒有設定面板或裝飾文字。

style.css採三層：原始色票（blue／mist／slate）→用途（accent／surface／ink／muted／track）→元件（card-bg／card-border）。config.js的lightAccent／darkAccent與lightSurface／darkSurface映射回原始色票，網址accent覆蓋用途主色。

| 字型角色 | 用途 | 基準字級（SVG座標） |
|---|---|---|
| font-display | 標題、休息大字 | 30／84 |
| font-body | 說明、小時單位 | 24／26／44 |
| font-number | 倒數、時間與百分比 | 24／26／144 |

原始字級size-*映射type-*用途變數。標題／狀態／休息文案會量測實際字寬，必要時縮小以不超出固定安全範圍；需更改此範圍或最大字級時，同步widget.js的fit呼叫。

採512×512向量畫布，按容器等比例縮放，主畫布最大512px。主要邊界8／80，卡片圓角96，插畫可用個別幾何位置；不額外引入排版框架。Notion嵌入建議給240–360px正方形或更大；若容器太矮，會整體縮小以保持完整。

動態只使用蒸氣的transform／opacity與進度斜紋transform。數值和進度依當下時間每秒更新，非依動畫累積。減少動態關閉裝飾，背景／前景隱藏時暫停，回來立即更新。aria-describedby以SVGdesc提供目前狀態，不設每秒報讀的live region；另提供可存取的progressbar。

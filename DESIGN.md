# 下班倒數的設計規範

方向：與notion-clock-calendar/todo-preview.html一致的中性色卡片：暖灰底#f9f8f7、邊線#e4e1db、字色#37352f／#706e68、點綴藍#4f91c7與進度淺藍#a9d4f5。深色為#252525底、#383838邊線、#e5e5e2／#aaa9a4字色、#8bbcdf與#82b5da藍色。整張卡片同色，不額外切分標題區。平時以時計與進度為主；下班與休息日換咖啡杯。外圍透明，沒有設定面板或裝飾文字。

style.css採三層：原始色票（blue／mist／slate）→用途（accent／surface／ink／muted／track）→元件（card-bg／card-border）。config.js的lightAccent／darkAccent與lightSurface／darkSurface映射回原始色票，網址accent覆蓋用途主色。

| 字型角色 | 用途 | 基準字級（SVG座標） |
|---|---|---|
| font-display | 標題、休息大字 | 30／84 |
| font-body | 說明、小時單位 | 24／26／44 |
| font-number | 倒數、時間與百分比 | 24／26／144 |

原始字級size-*映射type-*用途變數。標題／狀態／休息文案會量測實際字寬，必要時縮小以不超出固定安全範圍；需更改此範圍或最大字級時，同步widget.js的fit呼叫。

採512×512向量畫布，按容器等比例縮放，主畫布最大512px。外圍留白16px；HTML卡片使用1px邊框、依容器12–18px圓角（與參考頁公式相同），不隨SVG放大而變粗。內容左右邊界80。字體沿用參考頁系統無襯線，標題與大數字600字重，補充資訊400。Notion嵌入建議給240–360px正方形或更大；若容器太矮，會整體縮小以保持完整。

style.css與config.js使用同步版本參數。發布配色或結構變更時必須一併更新版本，避免Notion／瀏覽器拿新版HTML混用舊快取造成黑塊、直角或舊色票。

進度使用平面淺藍色，移除漸層與斜紋。動態只保留蒸氣的transform／opacity和時計。數值和進度依當下時間每秒更新，非依動畫累積。減少動態關閉裝飾，背景／前景隱藏時暫停，回來立即更新。aria-describedby以SVGdesc提供目前狀態，不設每秒報讀的live region；另提供可存取的progressbar。

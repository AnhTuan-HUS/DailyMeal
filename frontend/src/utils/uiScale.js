// Đồng bộ tỉ lệ giao diện giữa các máy (khác độ phân giải / Windows scaling).
// Layout luôn được dựng như thể cửa sổ rộng DESIGN_WIDTH px, rồi phóng/thu
// theo chiều rộng thực tế của cửa sổ.
const DESIGN_WIDTH = 1536   // 1920px @125% - kích thước máy thiết kế
const MIN_VIEWPORT = 1024   // dưới mức này dùng responsive bình thường
const MIN_ZOOM = 0.8
const MAX_ZOOM = 1.6

export function applyUiScale() {
  const root = document.documentElement
  const w = window.innerWidth
  let zoom = w >= MIN_VIEWPORT ? w / DESIGN_WIDTH : 1
  zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))
  root.style.zoom = String(zoom)
  root.style.setProperty('--ui-zoom', String(zoom))
}

applyUiScale()
window.addEventListener('resize', applyUiScale)


import { useState, useEffect, useRef } from 'react'
import { dishes } from '@/data/dishes'
import { useToast } from '@/context/ToastContext'

// Danh mục cẩm nang cứu món
const RESCUE_TIPS = [
  {
    id: 'salty',
    title: 'Món kho / canh bị quá mặn',
    badge: 'Xử lý vị mặn',
    causes: 'Lỡ tay trút nhiều nước mắm, kho cạn nước quá nhanh.',
    solutions: [
      'Thả 2–3 lát khoai tây sống gọt vỏ vào đun 5 phút (khoai tây hút bớt muối cực nhanh).',
      'Thêm một ít nước sôi hoặc nước dừa tươi ấm để làm loãng.',
      'Nêm một chút đường hoặc vài giọt giấm gạo để trung hòa độ chát mặn.',
    ],
  },
  {
    id: 'spicy',
    title: 'Món ăn bị quá cay',
    badge: 'Giảm cay cấp tốc',
    causes: 'Ớt hiểm hoặc tiêu xay nêm quá tay.',
    solutions: [
      'Cho thêm 1–2 thìa sữa tươi không đường, nước cốt dừa hoặc sữa đặc (chất béo làm tan capsaicin của ớt).',
      'Thêm chút đường cát hoặc mật ong để làm dịu vị cay nóng ở đầu lưỡi.',
      'Tăng thêm lượng rau củ (cà rốt, khoai tây) để phân tán độ cay trong đĩa.',
    ],
  },
  {
    id: 'bland',
    title: 'Canh bị nhạt nhẽo, loãng vị',
    badge: 'Tăng vị đậm đà',
    causes: 'Nước canh nhiều nhưng ít đạm hoặc ninh chưa đủ độ.',
    solutions: [
      'Phi thơm chút hành tím băm với chút dầu ăn, xào săn 50g thịt băm hoặc tôm khô rồi trút vào nồi.',
      'Nêm 1 thìa nước mắm ngon nguyên chất ngay trước khi tắt bếp để dậy mùi thơm.',
      'Thêm vài lát gừng đập dập hoặc nấm hương ngâm nở để tạo chiều sâu cho nước dùng.',
    ],
  },
  {
    id: 'burnt',
    title: 'Cháy khét đáy nồi',
    badge: 'Cứu món cháy',
    causes: 'Lửa quá to khi rim hoặc quên không đảo đáy.',
    solutions: [
      'TẮT BẾP NGAY LẬP TỨC. Tuyệt đối không dùng đũa cạo đáy nồi.',
      'Múc nhẹ nhàng phần thức ăn bên trên sang một nồi sạch khác.',
      'Cắt bỏ những miếng bị xém đen, phi thơm hành tỏi mới rồi đổ chút nước sốt ấm vào rim lại nhỏ lửa.',
    ],
  },
  {
    id: 'sour',
    title: 'Canh chua bị gắt họng',
    badge: 'Cân bằng độ chua',
    causes: 'Nhiều me, dứa chua hoặc giấm bỗng quá nồng.',
    solutions: [
      'Thêm 1 thìa cà phê đường phèn hoặc đường cát để dịu bớt độ gắt của axit.',
      'Nêm thêm một chút muối hạt (muối làm vị chua trở nên đượm và thanh mát hơn).',
      'Thêm vài lát đậu phụ non hoặc chan thêm chút nước luộc gà/thịt ấm.',
    ],
  },
  {
    id: 'tough',
    title: 'Thịt bò / thịt lợn bị khô, dai',
    badge: 'Làm mềm thịt',
    causes: 'Thái dọc thớ hoặc xào quá lâu trên lửa nhỏ.',
    solutions: [
      'Thái mỏng lại theo ngang thớ thịt.',
      'Ướp nhanh với 1 thìa dầu ăn, chút lòng trắng trứng hoặc vài lát dứa thái mỏng trong 5–7 phút.',
      'Nếu là món kho: Thêm nước sôi xâm xấp mặt thịt, đậy vung kho lửa nhỏ thêm 15 phút.',
    ],
  },
]

// Bảng quy đổi đơn vị dân dã
const UNIT_CONVERSIONS = [
  { name: '1 Thìa canh (muỗng canh)', value: '~15 ml', note: 'Khoảng 1 thìa ăn phở' },
  { name: '1 Thìa cà phê', value: '~5 ml', note: 'Thìa nhỏ khuấy cà phê' },
  { name: '1 Bát ăn cơm', value: '~250 ml', note: 'Bát sứ tiêu chuẩn' },
  { name: '1 Lạng thịt / cá', value: '100 gram', note: 'Đơn vị mua quen thuộc ở chợ' },
  { name: '1 Mớ / Bó rau', value: '~300 – 400g', note: 'Đủ cho gia đình 3–4 người' },
  { name: '1 Nhúm gia vị', value: '~1 – 2 gram', note: 'Kẹp giữa 2 đầu ngón tay' },
]

export default function CookPage({ activeRecipeId, onShowRecipe }) {
  const toast = useToast()

  // Chế độ xem: 'recipe' (Chi tiết công thức & Timer), 'timeline' (2 bếp 30p), 'rescue' (Cứu món)
  const [activeTab, setActiveTab] = useState('recipe')

  // Món đang chọn nấu
  const [selectedDishId, setSelectedDishId] = useState(activeRecipeId || dishes[0].id)
  const selectedDish = dishes.find(d => d.id === selectedDishId) || dishes[0]

  // Trạng thái các bước nấu đã xong
  const [doneSteps, setDoneSteps] = useState({})

  // Bộ đếm thời gian nấu (Timer)
  const [timerSeconds, setTimerSeconds] = useState(selectedDish.time * 60)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const timerRef = useRef(null)

  // Chế độ chữ lớn (Hands-free view)
  const [isLargeText, setIsLargeText] = useState(false)

  // Đồng bộ khi prop activeRecipeId thay đổi từ ngoài
  useEffect(() => {
    if (activeRecipeId) {
      setSelectedDishId(activeRecipeId)
      const d = dishes.find(item => item.id === activeRecipeId)
      if (d) setTimerSeconds(d.time * 60)
      setDoneSteps({})
      setIsTimerRunning(false)
    }
  }, [activeRecipeId])

  // Xử lý Timer chạy từng giây
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setIsTimerRunning(false)
            toast(`Hết giờ nấu món "${selectedDish.name}" rồi! Kiểm tra nồi nhé.`)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isTimerRunning, selectedDish.name, toast])

  // Chuyển món
  function handleSelectDish(dish) {
    setSelectedDishId(dish.id)
    setTimerSeconds(dish.time * 60)
    setIsTimerRunning(false)
    setDoneSteps({})
    if (onShowRecipe) onShowRecipe(dish.id)
  }

  // Tích chọn bước hoàn thành
  function toggleStep(idx) {
    setDoneSteps(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  // Timer controls
  function startPauseTimer() {
    if (timerSeconds === 0) setTimerSeconds(selectedDish.time * 60)
    setIsTimerRunning(prev => !prev)
  }

  function resetTimer() {
    setIsTimerRunning(false)
    setTimerSeconds(selectedDish.time * 60)
  }

  function addMinutes(mins) {
    setTimerSeconds(prev => prev + mins * 60)
    toast(`Đã cộng thêm ${mins} phút`)
  }

  const formatTimer = secs => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  return (
    <section id="page-cook" className={`cook-page${isLargeText ? ' is-large-text' : ''}`}>

      {/* ── Toolbar điều hướng 3 chế độ vào bếp ── */}
      <div className="cook-toolbar">
        <div className="cook-nav-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'recipe'}
            className={`cook-tab-btn${activeTab === 'recipe' ? ' active' : ''}`}
            onClick={() => setActiveTab('recipe')}
          >
            Nấu theo món & Hẹn giờ
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'timeline'}
            className={`cook-tab-btn${activeTab === 'timeline' ? ' active' : ''}`}
            onClick={() => setActiveTab('timeline')}
          >
            Điều phối 2 bếp (30 phút)
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'rescue'}
            className={`cook-tab-btn${activeTab === 'rescue' ? ' active' : ''}`}
            onClick={() => setActiveTab('rescue')}
          >
            Cứu món lỡ tay & Mẹo bếp
          </button>
        </div>

        <button
          className={`btn-cook-handsfree${isLargeText ? ' active' : ''}`}
          onClick={() => setIsLargeText(!isLargeText)}
          title="Bật/Tắt chế độ chữ lớn để nhìn từ xa khi tay ướt"
        >
          {isLargeText ? 'Cỡ chữ chuẩn' : 'Chế độ chữ lớn (Rảnh tay)'}
        </button>
      </div>

      {/* ── TAB 1: NẤU THEO MÓN & HẸN GIỜ ── */}
      {activeTab === 'recipe' && (
        <div className="cook-recipe-view">
          {/* Dải chọn món nhanh */}
          <div className="cook-dish-selector">
            <span className="selector-label">Chọn món nấu:</span>
            <div className="selector-chips">
              {dishes.map(d => (
                <button
                  key={d.id}
                  className={`dish-chip${d.id === selectedDish.id ? ' active' : ''}`}
                  onClick={() => handleSelectDish(d)}
                >
                  <span className="chip-name">{d.name}</span>
                  <span className="chip-time">{d.time}p</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chi tiết món & Bộ đếm Timer */}
          <div className="cook-main-card">
            {/* Cột trái: Thông tin món & Timer */}
            <div className="cook-left-col">
              <div className="cook-media-wrap">
                <img src={selectedDish.img} alt={selectedDish.name} className="cook-dish-img" />
                <span className="cook-cat-pill">{selectedDish.category}</span>
              </div>

              <div className="cook-dish-meta-box">
                <h2 className="cook-dish-name">{selectedDish.name}</h2>
                <p className="cook-dish-desc">{selectedDish.desc}</p>
                <div className="cook-chips-row">
                  <span className="cook-info-chip">Thời gian: <strong>{selectedDish.time} phút</strong></span>
                  <span className="cook-info-chip">Năng lượng: <strong>{selectedDish.cal}</strong></span>
                  <span className="cook-info-chip">Khẩu phần: <strong>{selectedDish.servings} người</strong></span>
                </div>
              </div>

              {/* Bộ đếm thời gian nấu Timer */}
              <div className="cook-timer-panel">
                <div className="timer-header">
                  <span className="timer-title">ĐỒNG HỒ HẸN GIỜ</span>
                  <span className={`timer-status-dot${isTimerRunning ? ' is-ticking' : ''}`} />
                </div>
                <div className="timer-digits">{formatTimer(timerSeconds)}</div>
                <div className="timer-controls">
                  <button
                    className={`btn-timer-toggle${isTimerRunning ? ' is-running' : ''}`}
                    onClick={startPauseTimer}
                  >
                    {isTimerRunning ? 'Tạm dừng' : timerSeconds === 0 ? 'Hẹn giờ lại' : 'Bắt đầu nấu'}
                  </button>
                  <button className="btn-timer-reset" onClick={resetTimer}>
                    Đặt lại
                  </button>
                </div>
                <div className="timer-preset-btns">
                  <button onClick={() => addMinutes(2)}>+2 phút</button>
                  <button onClick={() => addMinutes(5)}>+5 phút</button>
                  <button onClick={() => addMinutes(10)}>+10 phút</button>
                </div>
              </div>
            </div>

            {/* Cột phải: Nguyên liệu & Các bước nấu */}
            <div className="cook-right-col">
              {/* Nguyên liệu */}
              <div className="cook-section-box">
                <div className="section-title-wrap">
                  <h3 className="section-title">Nguyên liệu cần chuẩn bị</h3>
                  <span className="section-count">{selectedDish.ingredients.length} món</span>
                </div>
                <ul className="cook-ing-list">
                  {selectedDish.ingredients.map((ing, i) => (
                    <li key={i} className="cook-ing-item">
                      <span className="ing-bullet">•</span>
                      <span className="ing-text">{ing}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Các bước nấu */}
              <div className="cook-section-box">
                <div className="section-title-wrap">
                  <h3 className="section-title">Các bước thực hiện</h3>
                  <span className="section-count">{selectedDish.steps.length} bước</span>
                </div>
                <div className="cook-steps-list">
                  {selectedDish.steps.map((step, idx) => {
                    const isDone = !!doneSteps[idx]
                    return (
                      <div
                        key={idx}
                        className={`cook-step-card${isDone ? ' is-done' : ''}`}
                        onClick={() => toggleStep(idx)}
                      >
                        <div className="step-num-badge">
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <div className="step-content">
                          <strong className="step-header">Bước {idx + 1}</strong>
                          <p className="step-body">{step}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ĐIỀU PHỐI 2 BẾP (GANTT 30 PHÚT) ── */}
      {activeTab === 'timeline' && (
        <div className="cook-timeline-view">
          <div className="timeline-intro-card">
            <div className="intro-badge">PHƯƠNG PHÁP NẤU SONG SONG</div>
            <h3>Quy trình 2 bếp: Nấu mâm cơm 3 món trong 30 phút</h3>
            <p>
              Thay vì nấu tuần tự từng món mất 60 phút, phương pháp điều phối song song tận dụng thời gian chờ
              để kho thịt, nấu canh và xào rau cùng lúc mà thức ăn vẫn nóng hổi, giòn ngon.
            </p>
          </div>

          {/* Thước đo thời gian */}
          <div className="gantt-container">
            <div className="gantt-axis">
              <span className="axis-label">0p</span>
              <span className="axis-label">5p</span>
              <span className="axis-label">10p</span>
              <span className="axis-label">15p</span>
              <span className="axis-label">20p</span>
              <span className="axis-label">25p</span>
              <span className="axis-label">30p</span>
              <span className="axis-label">35p</span>
            </div>

            {/* Hàng 0: Nồi cơm điện */}
            <div className="gantt-row">
              <div className="gantt-row-head">
                <strong>Nồi cơm</strong>
                <small>Tự động</small>
              </div>
              <div className="gantt-track">
                <div
                  className="gantt-bar bar-rice"
                  style={{ left: '0%', width: '100%' }}
                >
                  <span className="bar-title">0–35p: Vo gạo, cắm nồi cơm điện (Cơm chín giữ ấm)</span>
                </div>
              </div>
            </div>

            {/* Hàng 1: Sơ chế dùng chung */}
            <div className="gantt-row">
              <div className="gantt-row-head">
                <strong>Sơ chế</strong>
                <small>Bàn bếp</small>
              </div>
              <div className="gantt-track">
                <div
                  className="gantt-bar bar-prep"
                  style={{ left: '0%', width: '15%' }}
                >
                  <span className="bar-title">0–5p: Nhặt rau, thái thịt, ướp gia vị</span>
                </div>
              </div>
            </div>

            {/* Hàng 2: Bếp 1 - Món mặn (Nấu chậm riu riu) */}
            <div className="gantt-row">
              <div className="gantt-row-head">
                <strong>Bếp 1</strong>
                <small>Món kho / om</small>
              </div>
              <div className="gantt-track">
                <div
                  className="gantt-bar bar-main"
                  style={{ left: '15%', width: '58%' }}
                >
                  <span className="bar-title">5–25p: Đảo săn thịt cá $\rightarrow$ Thêm nước màu, đậy vung kho lửa nhỏ riu riu</span>
                </div>
                {/* Điểm trích nhánh khẩu vị */}
                <div
                  className="gantt-branch-marker"
                  style={{ left: '60%' }}
                  title="Điểm trích nhánh khẩu vị: Trích phần ăn cho trẻ em/người già trước khi nêm tiêu, ớt"
                >
                  <span className="branch-flag">Phút 20: Trích phần trẻ em</span>
                </div>
              </div>
            </div>

            {/* Hàng 3: Bếp 2 - Canh & Xào (Nấu nhanh lửa lớn) */}
            <div className="gantt-row">
              <div className="gantt-row-head">
                <strong>Bếp 2</strong>
                <small>Canh & Xào</small>
              </div>
              <div className="gantt-track">
                <div
                  className="gantt-bar bar-soup"
                  style={{ left: '15%', width: '30%' }}
                >
                  <span className="bar-title">5–15p: Đun canh, múc ra bát</span>
                </div>
                <div
                  className="gantt-bar bar-veg"
                  style={{ left: '46%', width: '15%' }}
                >
                  <span className="bar-title">15–20p: Xào rau lửa lớn</span>
                </div>
              </div>
            </div>

            {/* Hàng 4: Bày mâm */}
            <div className="gantt-row">
              <div className="gantt-row-head">
                <strong>Lên mâm</strong>
                <small>Dọn ăn</small>
              </div>
              <div className="gantt-track">
                <div
                  className="gantt-bar bar-done"
                  style={{ left: '73%', width: '15%' }}
                >
                  <span className="bar-title">25–28p: Dọn cơm nóng</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hướng dẫn chi tiết từng chặng */}
          <div className="timeline-stages-grid">
            <div className="stage-card">
              <span className="stage-step-tag">CHẶNG 1 · 0–5 PHÚT</span>
              <h4>Sơ chế chung</h4>
              <p>Rửa rau củ, thái thịt cá và ướp mắm tiêu hành tỏi. Vo gạo cắm nồi cơm điện ngay từ phút đầu tiên.</p>
            </div>
            <div className="stage-card">
              <span className="stage-step-tag">CHẶNG 2 · 5–15 PHÚT</span>
              <h4>Bật 2 bếp cùng lúc</h4>
              <p>Bếp 1 đảo săn thịt rồi hạ lửa nhỏ kho riu riu. Bếp 2 đun sôi nước nấu canh, nêm vừa ăn rồi múc ra bát lớn.</p>
            </div>
            <div className="stage-card">
              <span className="stage-step-tag">CHẶNG 3 · 15–25 PHÚT</span>
              <h4>Xào rau & Trích khẩu vị</h4>
              <p>Tận dụng Bếp 2 xào rau xanh giòn. Ở Bếp 1, múc phần thịt mềm chưa cay ra cho bé trước khi nêm ớt/tiêu.</p>
            </div>
            <div className="stage-card">
              <span className="stage-step-tag">CHẶNG 4 · 25–28 PHÚT</span>
              <h4>Hoàn tất & Lên mâm</h4>
              <p>Tắt cả 2 bếp, múc thịt kho sệt nước ra đĩa sâu lòng. Mâm cơm 3 món chuẩn vị đã sẵn sàng thưởng thức!</p>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: CỨU MÓN LỠ TAY & MẸO BẾP ── */}
      {activeTab === 'rescue' && (
        <div className="cook-rescue-view">
          <div className="rescue-intro-card">
            <div className="intro-badge">CẨM NANG XỬ LÝ SỰ CỐ</div>
            <h3>Cứu món lỡ tay & Mẹo bếp nhanh</h3>
            <p>
              Khi nêm quá tay, cháy đáy nồi hay canh chua bị gắt, đừng vội đổ bỏ. Hãy áp dụng ngay những mẹo dân dã
              kinh nghiệm để cứu vị món ăn chỉ trong vài phút.
            </p>
          </div>

          {/* Lưới các thẻ cứu món */}
          <div className="rescue-cards-grid">
            {RESCUE_TIPS.map(tip => (
              <div key={tip.id} className="rescue-card">
                <div className="rescue-card-top">
                  <span className="rescue-badge">{tip.badge}</span>
                  <h4 className="rescue-title">{tip.title}</h4>
                  <p className="rescue-cause"><strong>Nguyên nhân:</strong> {tip.causes}</p>
                </div>
                <div className="rescue-solution-box">
                  <strong>Cách xử lý ngay:</strong>
                  <ul>
                    {tip.solutions.map((sol, idx) => (
                      <li key={idx}>{sol}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Bảng quy đổi đơn vị dân dã */}
          <div className="unit-conversion-card">
            <h4>Bảng quy đổi đơn vị đong nêm dân dã bếp Việt</h4>
            <div className="unit-grid">
              {UNIT_CONVERSIONS.map((unit, i) => (
                <div key={i} className="unit-item">
                  <strong className="unit-name">{unit.name}</strong>
                  <span className="unit-val">{unit.value}</span>
                  <small className="unit-note">{unit.note}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </section>
  )
}

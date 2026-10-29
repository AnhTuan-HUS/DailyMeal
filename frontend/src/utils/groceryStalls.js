// Phân loại nguyên liệu vào 4 quầy chợ
const KEYWORDS = {
  meat: [
    'thịt', 'gà', 'heo', 'bò', 'cá', 'tôm', 'mực', 'cua', 'sườn', 'ba chỉ',
    'nạc', 'phi lê', 'lườn', 'chân giò', 'giò', 'lòng', 'tim', 'gan', 'bạch tuộc',
    'trai', 'sò', 'hàu', 'lươn', 'ếch', 'vịt', 'ngan',
  ],
  veggie: [
    'rau', 'cải', 'bắp cải', 'cà', 'cà chua', 'cà rốt', 'bí', 'khoai', 'củ',
    'hành', 'tỏi', 'gừng', 'sả', 'ớt', 'dưa', 'đậu bắp', 'măng', 'nấm',
    'giá', 'mồng tơi', 'rau muống', 'cần', 'xà lách', 'bông cải', 'ngô', 'bắp',
    'hành lá', 'ngò', 'rau thơm', 'húng', 'kinh giới', 'tía tô',
  ],
  egg: [
    'trứng', 'đậu phụ', 'đậu hũ', 'đậu nành', 'đậu đen', 'đậu xanh', 'đậu đỏ',
    'đậu lăng', 'sữa đậu', 'tàu hũ', 'miso',
  ],
  dry: [
    'gạo', 'mì', 'bún', 'phở', 'miến', 'nui', 'bánh', 'bột', 'tinh bột',
    'dầu', 'mỡ', 'muối', 'đường', 'mắm', 'nước mắm', 'tương', 'xì dầu',
    'hạt nêm', 'bột ngọt', 'tiêu', 'gia vị', 'nước tương', 'giấm',
    'dừa', 'lon', 'hộp', 'đồ khô', 'khô', 'mắm ruốc', 'sa tế',
  ],
}

const STALLS = [
  { key: 'meat',   label: '🥩 Thịt & Cá' },
  { key: 'veggie', label: '🥬 Rau củ' },
  { key: 'egg',    label: '🥚 Trứng & Đậu' },
  { key: 'dry',    label: '🧂 Đồ khô & Gia vị' },
]

export function classifyIngredient(name) {
  const lower = name.toLowerCase()
  for (const stall of STALLS) {
    if (KEYWORDS[stall.key].some(kw => lower.includes(kw))) return stall.key
  }
  return 'dry' // mặc định vào Đồ khô & Gia vị
}

export function groupByStall(ingredients) {
  const groups = {}
  for (const stall of STALLS) groups[stall.key] = []

  ingredients.forEach((item, idx) => {
    const key = classifyIngredient(item[0])
    groups[key].push({ name: item[0], qty: item[1], idx })
  })

  return STALLS.map(s => ({ ...s, items: groups[s.key] })).filter(s => s.items.length > 0)
}

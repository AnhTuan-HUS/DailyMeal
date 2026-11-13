// Phân loại nguyên liệu vào các quầy chợ
const KEYWORDS = {
  egg: [
    'trứng', 'trứng gà', 'trứng vịt', 'trứng cút', 'hột vịt',
    'đậu', 'đậu phụ', 'đậu hũ', 'đậu nành', 'đậu đen', 'đậu xanh', 'đậu đỏ',
    'đậu lăng', 'sữa đậu', 'tàu hũ', 'miso', 'chao',
  ],
  meat: [
    'thịt', 'gà', 'heo', 'lợn', 'bò', 'cá', 'tôm', 'mực', 'cua', 'sườn', 'ba chỉ',
    'nạc', 'phi lê', 'lườn', 'chân giò', 'giò', 'lòng', 'tim', 'gan', 'bạch tuộc',
    'trai', 'sò', 'hàu', 'lươn', 'ếch', 'vịt', 'ngan', 'chả', 'nem', 'xúc xích',
  ],
  veggie: [
    'rau', 'cải', 'bắp cải', 'cà', 'cà chua', 'cà rốt', 'bí', 'khoai', 'củ',
    'hành', 'tỏi', 'gừng', 'sả', 'ớt', 'dưa', 'đậu bắp', 'măng', 'nấm',
    'giá', 'mồng tơi', 'rau muống', 'cần', 'xà lách', 'bông cải', 'ngô', 'bắp',
    'hành lá', 'ngò', 'rau thơm', 'húng', 'kinh giới', 'tía tô', 'chanh',
  ],
  dry: [
    'gạo', 'mì', 'bún', 'phở', 'miến', 'nui', 'bánh', 'bột', 'tinh bột',
    'dầu', 'mỡ', 'muối', 'đường', 'mắm', 'nước mắm', 'tương', 'xì dầu',
    'hạt nêm', 'bột ngọt', 'tiêu', 'gia vị', 'nước tương', 'giấm',
    'dừa', 'lon', 'hộp', 'đồ khô', 'khô', 'mắm ruốc', 'sa tế',
  ],
}

// Danh sách các quầy chợ bao gồm cả quầy Khác
const STALLS = [
  { key: 'meat',   label: 'Thịt & Cá' },
  { key: 'veggie', label: 'Rau củ' },
  { key: 'egg',    label: 'Trứng & Đậu' },
  { key: 'dry',    label: 'Đồ khô & Gia vị' },
  { key: 'other',  label: 'Khác' },
]

export function classifyIngredient(name) {
  const lower = name.toLowerCase().trim()
  // Thứ tự ưu tiên kiểm tra: Trứng & Đậu -> Thịt & Cá -> Rau củ -> Đồ khô
  const checkOrder = ['egg', 'meat', 'veggie', 'dry']
  for (const key of checkOrder) {
    if (KEYWORDS[key].some(kw => lower.includes(kw))) return key
  }
  // Những nguyên liệu chưa xác định được nhóm -> tự động vào quầy 'other' (Khác)
  return 'other'
}

export function groupByStall(ingredients) {
  const groups = { meat: [], veggie: [], egg: [], dry: [], other: [] }

  ingredients.forEach((item, idx) => {
    const key = classifyIngredient(item[0])
    groups[key].push({ name: item[0], qty: item[1], idx })
  })

  // 4 quầy chính luôn hiển thị; quầy 'Khác' luôn hiển thị để người dùng dễ theo dõi
  return STALLS.map(s => ({ ...s, items: groups[s.key] }))
}

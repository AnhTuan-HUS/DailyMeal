export const dishes = [
  {
    id: 1,
    name: 'Thịt kho tàu',
    category: 'Món truyền thống',
    type: 'man',
    time: 45,
    servings: 4,
    cal: '420 kcal',
    img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    desc: 'Thịt mềm béo, trứng thấm vị, đưa cơm.',
    ingredients: ['500g thịt ba chỉ', '4 quả trứng', 'Nước mắm, đường, hành'],
    steps: [
      'Thịt rửa sạch, thái miếng vừa ăn và ướp cùng nước mắm, đường, hành.',
      'Thắng nước màu, cho thịt vào đảo săn rồi thêm nước dừa.',
      'Kho nhỏ lửa khoảng 35 phút, thêm trứng và nêm vừa ăn.',
    ],
  },
  {
    id: 2,
    name: 'Canh chua cá',
    category: 'Thanh mát',
    type: 'canh',
    time: 30,
    servings: 3,
    cal: '210 kcal',
    img: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80',
    desc: 'Chua dịu, thơm mùi rau, ngon miệng ngày hè.',
    ingredients: ['400g cá', '2 quả cà chua', 'Dứa, me, giá đỗ, rau thơm'],
    steps: [
      'Sơ chế cá, cà chua, dứa và các loại rau.',
      'Phi thơm hành, xào cà chua rồi thêm nước và me.',
      'Cho cá vào nấu chín, thêm dứa và rau, nêm vừa ăn.',
    ],
  },
  {
    id: 3,
    name: 'Rau muống xào tỏi',
    category: 'Dễ làm',
    type: 'rau',
    time: 15,
    servings: 2,
    cal: '95 kcal',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    desc: 'Món rau xanh giòn, đơn giản và dễ kết hợp.',
    ingredients: ['1 bó rau muống', '4 tép tỏi', 'Dầu ăn, muối'],
    steps: [
      'Rau muống nhặt, rửa sạch và để ráo.',
      'Phi thơm tỏi với dầu, cho rau vào xào trên lửa lớn.',
      'Nêm gia vị vừa ăn, đảo nhanh để rau giữ độ giòn.',
    ],
  },
  {
    id: 4,
    name: 'Cá hồi áp chảo',
    category: 'Bổ dưỡng',
    type: 'man',
    time: 20,
    servings: 2,
    cal: '350 kcal',
    img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    desc: 'Cá hồi mềm thơm, ăn kèm rau củ tươi.',
    ingredients: ['2 miếng cá hồi', 'Chanh, tiêu, muối', 'Rau củ ăn kèm'],
    steps: [
      'Thấm khô cá, ướp muối và tiêu trong 10 phút.',
      'Áp chảo mặt da trước đến khi vàng giòn, lật mặt còn lại.',
      'Vắt chanh nhẹ và dùng cùng rau củ.',
    ],
  },
  {
    id: 5,
    name: 'Phở bò',
    category: 'Món truyền thống',
    type: 'man',
    time: 45,
    servings: 4,
    cal: '390 kcal',
    img: 'https://images.unsplash.com/photo-1582878826629-29b7ad1dbcfd?auto=format&fit=crop&w=800&q=80',
    desc: 'Nước dùng thơm, bánh phở mềm và thịt bò.',
    ingredients: ['Bánh phở', '300g thịt bò', 'Nước dùng, hành, gừng, rau thơm'],
    steps: [
      'Nướng thơm gừng và hành, cho vào nồi nước dùng.',
      'Trụng bánh phở, thái thịt bò thật mỏng.',
      'Chan nước dùng nóng, thêm thịt và rau thơm.',
    ],
  },
  {
    id: 6,
    name: 'Gà rang gừng',
    category: 'Món truyền thống',
    type: 'man',
    time: 40,
    servings: 4,
    cal: '330 kcal',
    img: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=800&q=80',
    desc: 'Gà săn chắc, thơm gừng, vị mặn ngọt hài hòa.',
    ingredients: ['600g thịt gà', '1 nhánh gừng', 'Nước mắm, tiêu, hành'],
    steps: [
      'Gà chặt miếng vừa ăn, ướp gia vị khoảng 15 phút.',
      'Phi thơm hành và gừng, cho gà vào rang săn.',
      'Thêm chút nước, rim đến khi gà chín và nước sệt.',
    ],
  },
  {
    id: 7,
    name: 'Bánh cuốn',
    category: 'Dễ làm',
    type: 'man',
    time: 25,
    servings: 3,
    cal: '280 kcal',
    img: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    desc: 'Bánh mềm thơm, ăn cùng rau và nước chấm.',
    ingredients: ['Bánh cuốn', 'Thịt băm, mộc nhĩ', 'Hành phi, nước mắm'],
    steps: [
      'Xào nhân thịt với mộc nhĩ đã băm nhỏ.',
      'Làm nóng bánh, cho nhân vào và cuốn lại.',
      'Rắc hành phi, dùng cùng nước chấm pha dịu vị.',
    ],
  },
  {
    id: 8,
    name: 'Bún chả',
    category: 'Món truyền thống',
    type: 'man',
    time: 45,
    servings: 4,
    cal: '460 kcal',
    img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80',
    desc: 'Thịt nướng thơm, rau sống và nước chấm chua ngọt.',
    ingredients: ['500g thịt lợn', 'Bún tươi, rau sống', 'Nước mắm, tỏi, chanh'],
    steps: [
      'Thịt thái miếng, ướp nước mắm, đường và hành.',
      'Nướng hoặc áp chảo đến khi thịt chín vàng.',
      'Pha nước chấm chua ngọt, ăn kèm bún và rau.',
    ],
  },
  {
    id: 9,
    name: 'Salad rau củ',
    category: 'Thanh mát',
    type: 'rau',
    time: 15,
    servings: 2,
    cal: '160 kcal',
    img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    desc: 'Rau củ tươi giòn, sốt nhẹ, nhiều màu sắc.',
    ingredients: ['Xà lách, cà chua', 'Dưa chuột, cà rốt', 'Dầu ô liu, chanh'],
    steps: [
      'Rửa sạch và để ráo các loại rau củ.',
      'Cắt miếng vừa ăn, trộn cùng nước sốt.',
      'Dùng ngay khi rau còn tươi giòn.',
    ],
  },
];

export const initialIngredients = [
  ['Thịt ba chỉ', '500g'],
  ['Trứng gà', '4 quả'],
  ['Cá hồi', '300g'],
  ['Cà chua', '3 quả'],
  ['Rau muống', '300g'],
  ['Hành lá', '1 bó'],
  ['Tỏi', '1 củ'],
  ['Gừng', '50g'],
];

// Loại món (dùng cho chip lọc ở trang Món đã lưu)
export const dishTypes = [
  { id: 'man',  label: 'Món mặn' },
  { id: 'canh', label: 'Canh' },
  { id: 'rau',  label: 'Rau' },
]

// Vai trò trong gia đình -> emoji đại diện
export const memberRoles = [
  { id: 'bo',       label: 'Bố',       emoji: '👨🏻' },
  { id: 'me',       label: 'Mẹ',       emoji: '👩🏻' },
  { id: 'con-trai', label: 'Con trai', emoji: '👦🏻' },
  { id: 'con-gai',  label: 'Con gái',  emoji: '👧🏻' },
  { id: 'ong',      label: 'Ông',      emoji: '👴🏻' },
  { id: 'ba',       label: 'Bà',       emoji: '👵🏻' },
  { id: 'khac',     label: 'Khác',     emoji: '🧑🏻' },
]

export const familyMembers = [
  { id: 1, role: 'bo',       name: 'Bố',       age: 35, likes: ['Thịt', 'Cá', 'Rau xanh'],        allergies: [] },
  { id: 2, role: 'me',       name: 'Mẹ',       age: 32, likes: ['Rau củ', 'Canh thanh mát'],     allergies: ['Hải sản có vỏ'] },
  { id: 3, role: 'con-trai', name: 'Con trai', age: 8,  likes: ['Thịt', 'Trứng'],                allergies: [] },
  { id: 4, role: 'con-gai',  name: 'Con gái',  age: 5,  likes: ['Cá', 'Súp', 'Trái cây'],        allergies: ['Đậu phộng'] },
]

// Hồ sơ bữa ăn mặc định của cả nhà
export const initialMealProfile = {
  soft: true,          // Mềm
  lowSalt: true,       // Ít mặn
  noSpicy: false,      // Không cay
  lowSugar: false,     // Ít ngọt
  excluded: ['Hành sống', 'Nội tạng', 'Dứa'],
  defaultServings: 4,
}

// Lịch sử 7 ngày gần nhất (0 = hôm qua). status: cooked | skipped | swapped
export const initialHistory = [
  { daysAgo: 1, dishId: 2, status: null },
  { daysAgo: 2, dishId: 1, status: 'cooked' },
  { daysAgo: 3, dishId: 3, status: 'cooked' },
  { daysAgo: 4, dishId: 8, status: 'swapped', swappedTo: 'Bánh cuốn' },
  { daysAgo: 5, dishId: 6, status: 'skipped' },
  { daysAgo: 6, dishId: 1, status: 'cooked' },
  { daysAgo: 7, dishId: 4, status: 'cooked' },
]

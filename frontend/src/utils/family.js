import { memberRoles } from '../data/dishes'

// ---------- Thành viên ----------

export function roleOf(roleId) {
  return memberRoles.find(r => r.id === roleId) || memberRoles[memberRoles.length - 1]
}

export function ageGroup(age) {
  if (age < 3) return 'Em bé'
  if (age < 12) return 'Trẻ em'
  if (age < 18) return 'Thiếu niên'
  if (age >= 60) return 'Người cao tuổi'
  return 'Người lớn'
}

export function prefLabel(member) {
  return member.likes.length ? 'Thích: ' + member.likes.join(', ') : 'Chưa ghi sở thích'
}

// ---------- Dị ứng / nguyên liệu loại trừ ----------

// Một số cụm dị ứng phổ biến được mở rộng thành các từ khóa cụ thể
const ALIASES = {
  'hải sản': ['tôm', 'cua', 'ghẹ', 'mực', 'ngao', 'sò', 'ốc', 'cá'],
  'hải sản có vỏ': ['tôm', 'cua', 'ghẹ', 'ngao', 'sò', 'ốc'],
  'đậu phộng': ['đậu phộng', 'lạc'],
  'sữa': ['sữa', 'phô mai', 'bơ sữa'],
  'gluten': ['bột mì', 'mì', 'bánh mì'],
  'nội tạng': ['gan', 'lòng', 'tim', 'bầu dục', 'dạ dày'],
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function keywordsFor(term) {
  const key = term.trim().toLowerCase()
  return ALIASES[key] ? [key, ...ALIASES[key]] : [key]
}

/**
 * Trả về danh sách nguyên liệu trong món trùng với các cụm dị ứng / loại trừ.
 * terms: mảng chuỗi, ví dụ ['Dứa', 'Hải sản có vỏ']
 * Kết quả: [{ term: 'Dứa' }, ...] (mỗi cụm tối đa 1 lần)
 */
export function findConflicts(dish, terms) {
  const haystack = [dish.name, ...dish.ingredients].join(', ').toLowerCase()
  const hits = []
  terms.forEach(term => {
    if (!term || !term.trim()) return
    const matched = keywordsFor(term).some(kw => {
      if (!kw) return false
      const re = new RegExp(`(?<![\\p{L}])${escapeRegExp(kw)}(?![\\p{L}])`, 'iu')
      return re.test(haystack)
    })
    if (matched) hits.push({ term })
  })
  return hits
}

// Gộp mọi dị ứng của cả nhà + nguyên liệu loại trừ (không trùng nhau)
export function collectAvoidTerms(members, excluded) {
  const set = new Map()
  members.forEach(m => m.allergies.forEach(a => set.set(a.toLowerCase(), a)))
  excluded.forEach(e => set.set(e.toLowerCase(), e))
  return [...set.values()]
}

// ---------- Ngày tháng ----------

export function dayLabel(daysAgo) {
  if (daysAgo === 0) return 'Hôm nay'
  if (daysAgo === 1) return 'Hôm qua'
  return `${daysAgo} ngày trước`
}

export function dateShort(daysAgo) {
  const d = new Date(Date.now() - daysAgo * 86400000)
  return d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

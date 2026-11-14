import { useState } from 'react'

// Ô nhập thẻ (chip) dùng chung: sở thích, dị ứng, nguyên liệu loại trừ
export default function TagInput({ id, value, onChange, placeholder, suggestions = [], tone = 'neutral' }) {
  const [draft, setDraft] = useState('')

  function add(raw) {
    const text = raw.trim()
    if (!text) return
    if (!value.some(v => v.toLowerCase() === text.toLowerCase())) onChange([...value, text])
    setDraft('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(draft)
    } else if (e.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1))
    }
  }

  const rest = suggestions.filter(s => !value.some(v => v.toLowerCase() === s.toLowerCase()))

  return (
    <div className="tag-input">
      <div className="tag-input-box">
        {value.map(v => (
          <span key={v} className={`tag tag-${tone}`}>
            {v}
            <button type="button" aria-label={`Xóa ${v}`} onClick={() => onChange(value.filter(x => x !== v))}>
              ×
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => add(draft)}
          placeholder={value.length ? 'Thêm...' : placeholder}
        />
      </div>
      {rest.length > 0 && (
        <div className="tag-suggest">
          <span>Gợi ý:</span>
          {rest.slice(0, 6).map(s => (
            <button type="button" key={s} onClick={() => add(s)}>
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

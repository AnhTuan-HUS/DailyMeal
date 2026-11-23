import { useMemo } from 'react'
import { dishes } from '../../data/dishes'
import { dayLabel, dateShort } from '../../utils/family'

const STATUS = {
  cooked:  { label: 'Đã nấu',     cls: 'tag-ok' },
  skipped: { label: 'Chưa nấu',   cls: 'tag-neutral' },
  swapped: { label: 'Đã đổi món', cls: 'tag-warn' },
}

export default function HistoryTab({ history, onSetStatus, onShowRecipe }) {
  const rows = [...history].sort((a, b) => a.daysAgo - b.daysAgo)
  const yesterday = rows.find(r => r.daysAgo === 1)
  const yesterdayDish = yesterday && dishes.find(d => d.id === yesterday.dishId)

  const count = s => rows.filter(r => r.status === s).length
  const pending = rows.filter(r => r.status === null).length
  const cookedPct = Math.round((count('cooked') / rows.length) * 100) || 0

  const suggestions = useMemo(() => {
    const used = new Set()
    const counts = {}
    history.forEach(h => {
      used.add(h.dishId)
      const swapped = h.swappedTo && dishes.find(d => d.name === h.swappedTo)
      if (swapped) used.add(swapped.id)
      if (h.status !== 'skipped') counts[h.dishId] = (counts[h.dishId] || 0) + 1
    })

    const out = []
    Object.entries(counts)
      .filter(([, n]) => n >= 2)
      .forEach(([id, n]) => {
        const from = dishes.find(d => d.id === Number(id))
        const to = dishes.find(d => d.type === from.type && !used.has(d.id))
        if (from && to) out.push({ key: `rep-${id}`, text: `${from.name} đã xuất hiện ${n} lần trong tuần.`, to })
      })

    const usedTypes = new Set(history.map(h => dishes.find(d => d.id === h.dishId)?.type))
    ;['rau', 'canh'].forEach(type => {
      if (!usedTypes.has(type)) {
        const to = dishes.find(d => d.type === type && !used.has(d.id))
        if (to) out.push({ key: `type-${type}`, text: `Tuần này chưa có món ${type === 'rau' ? 'rau' : 'canh'} nào.`, to })
      }
    })
    return out.slice(0, 3)
  }, [history])

  return (
    <div className="fam-history">
      {yesterday && yesterday.status === null && yesterdayDish && (
        <section className="panel ask-card">
          <div className="ask-card-text">
            <small>HỎI NHANH</small>
            <h3>Hôm qua nhà mình có nấu món {yesterdayDish.name} không?</h3>
            <p>Cập nhật giúp DailyMeal biết nhà đã ăn gì để gợi ý đổi vị cho hôm nay.</p>
          </div>
          <div className="ask-card-actions">
            <button className="primary" onClick={() => onSetStatus(1, 'cooked')}>✓ Đã nấu</button>
            <button className="btn-ghost" onClick={() => onSetStatus(1, 'skipped')}>Chưa nấu</button>
            <button
              className="btn-ghost"
              onClick={() => {
                const alt = dishes.find(d => d.id !== yesterdayDish.id)
                onSetStatus(1, 'swapped', alt.name)
              }}
            >
              Đã đổi món
            </button>
          </div>
        </section>
      )}

      <div className="fam-stats">
        <div className="fam-stat"><span className="fam-stat-ico ok">✓</span><div><strong>{count('cooked')}</strong><small>Đã nấu</small></div></div>
        <div className="fam-stat"><span className="fam-stat-ico">–</span><div><strong>{count('skipped')}</strong><small>Chưa nấu</small></div></div>
        <div className="fam-stat"><span className="fam-stat-ico warn">⇄</span><div><strong>{count('swapped')}</strong><small>Đã đổi món</small></div></div>
        <div className="fam-stat"><span className="fam-stat-ico">?</span><div><strong>{pending}</strong><small>Chưa cập nhật</small></div></div>
      </div>

      <div className="fam-history-grid">
        <section className="panel">
          <div className="history-head">
            <h3>7 ngày gần nhất</h3>
            <span className="history-pct">{cookedPct}% bữa nấu tại nhà</span>
          </div>
          <div className="progress" aria-hidden="true"><div style={{ width: `${cookedPct}%` }} /></div>

          <div className="history-list">
            {rows.map(r => {
              const dish = dishes.find(d => d.id === r.dishId)
              if (!dish) return null
              const st = r.status ? STATUS[r.status] : null
              return (
                <div key={r.daysAgo} className="history-row">
                  <div className="history-date">
                    <strong>{dayLabel(r.daysAgo)}</strong>
                    <small>{dateShort(r.daysAgo)}</small>
                  </div>
                  <img src={dish.img} alt="" loading="lazy" />
                  <div className="history-dish">
                    <strong>{dish.name}</strong>
                    <small>{dish.category} · {dish.time} phút</small>
                    {r.status === 'swapped' && (
                      <label className="swap-select">
                        Đổi sang:
                        <select
                          value={r.swappedTo || ''}
                          onChange={e => onSetStatus(r.daysAgo, 'swapped', e.target.value)}
                        >
                          {dishes.filter(d => d.id !== dish.id).map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>
                  <span className={`tag ${st ? st.cls : 'tag-muted'}`}>{st ? st.label : 'Chưa cập nhật'}</span>
                  <div className="seg" role="group" aria-label={`Trạng thái ${dayLabel(r.daysAgo)}`}>
                    {Object.entries(STATUS).map(([key, s]) => (
                      <button
                        key={key}
                        type="button"
                        className={r.status === key ? 'active' : ''}
                        onClick={() =>
                          onSetStatus(
                            r.daysAgo,
                            key,
                            key === 'swapped' ? (r.swappedTo || dishes.find(d => d.id !== dish.id).name) : undefined
                          )
                        }
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="panel">
          <h3>Gợi ý đổi vị</h3>
          <p className="panel-sub">Dựa trên những món nhà mình đã ăn trong tuần.</p>
          {suggestions.length === 0 ? (
            <p className="empty-state">Thực đơn tuần này khá đa dạng rồi, cứ phát huy nhé! 👏</p>
          ) : (
            <div className="suggest-list">
              {suggestions.map(s => (
                <div key={s.key} className="suggest-card">
                  <p>{s.text} Thử đổi vị với:</p>
                  <div className="suggest-dish">
                    <img src={s.to.img} alt="" loading="lazy" />
                    <div>
                      <strong>{s.to.name}</strong>
                      <small>{s.to.time} phút · {s.to.servings} người</small>
                    </div>
                    <button className="mini-btn" onClick={() => onShowRecipe && onShowRecipe(s.to.id)}>Xem</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

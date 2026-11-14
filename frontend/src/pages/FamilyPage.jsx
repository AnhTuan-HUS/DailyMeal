import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import MemberModal from '../components/family/MemberModal'
import MembersTab from '../components/family/MembersTab'
import ProfileTab from '../components/family/ProfileTab'
import HistoryTab from '../components/family/HistoryTab'

const TABS = [
  { id: 'members', label: 'Thành viên', ico: '♧' },
  { id: 'profile', label: 'Hồ sơ bữa ăn', ico: '☰' },
  { id: 'history', label: 'Lịch sử 7 ngày', ico: '◷' },
]

export default function FamilyPage({ onShowRecipe }) {
  const toast = useToast()
  const {
    members, addMember, updateMember, removeMember,
    mealProfile, updateMealProfile,
    history, setHistoryStatus,
  } = useApp()

  const [tab, setTab] = useState('members')
  const [modal, setModal] = useState(null) // null | { member: null | object }

  function handleSave(data) {
    if (modal.member) {
      updateMember(modal.member.id, data)
      toast(`Đã cập nhật thông tin ${data.name}`)
    } else {
      addMember(data)
      toast(`Đã thêm ${data.name} vào gia đình`)
    }
    setModal(null)
  }

  function handleDelete(member) {
    removeMember(member.id)
    toast(`Đã xóa ${member.name} khỏi gia đình`)
  }

  function handleStatus(daysAgo, status, swappedTo) {
    setHistoryStatus(daysAgo, status, swappedTo)
    toast('Đã cập nhật lịch sử bữa ăn')
  }

  return (
    <section id="page-family">
      <div className="section-head">
        <p>Ghi nhớ sở thích để DailyMeal gợi ý bữa ăn phù hợp.</p>
        {tab === 'members' && (
          <button className="primary" onClick={() => setModal({ member: null })}>
            + Thêm thành viên
          </button>
        )}
      </div>

      <div className="fam-tabs" role="tablist" aria-label="Quản lý gia đình">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`fam-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span>{t.ico}</span>
            {t.label}
            {t.id === 'members' && <em className="fam-tab-count">{members.length}</em>}
          </button>
        ))}
      </div>

      {tab === 'members' && (
        <MembersTab
          members={members}
          onAdd={() => setModal({ member: null })}
          onEdit={m => setModal({ member: m })}
          onDelete={handleDelete}
        />
      )}
      {tab === 'profile' && (
        <ProfileTab
          members={members}
          profile={mealProfile}
          onChange={updateMealProfile}
          onShowRecipe={onShowRecipe}
        />
      )}
      {tab === 'history' && (
        <HistoryTab history={history} onSetStatus={handleStatus} onShowRecipe={onShowRecipe} />
      )}

      {modal && (
        <MemberModal member={modal.member} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </section>
  )
}

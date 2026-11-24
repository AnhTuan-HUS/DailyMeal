import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useToast } from '@/context/ToastContext'
import MemberModal from '../components/family/MemberModal'
import MembersTab from '../components/family/MembersTab'
import ProfileTab from '../components/family/ProfileTab'
import HistoryTab from '../components/family/HistoryTab'

const TABS = [
  {
    id: 'members',
    label: 'Thành viên',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'Hồ sơ khẩu vị',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'Lịch sử 7 ngày',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
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
    <section id="page-family" className="fam-page-container">
      {/* Header khu vực với mô tả editorial */}
      <div className="section-head fam-head-row">
        <div>
          <p className="fam-lead-text">
            Ghi nhớ khẩu vị, chế độ ăn và dị ứng của từng thành viên để mỗi bữa cơm gia đình đều trọn vẹn.
          </p>
        </div>
        {tab === 'members' && (
          <button
            type="button"
            className="primary fam-add-btn-primary"
            onClick={() => setModal({ member: null })}
          >
            <span aria-hidden="true">+</span>
            <span>Thêm thành viên</span>
          </button>
        )}
      </div>

      {/* Tabs điều hướng tinh tế */}
      <div className="fam-tabs" role="tablist" aria-label="Quản lý gia đình">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`fam-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="fam-tab-icon" aria-hidden="true">{t.icon}</span>
            <span className="fam-tab-label">{t.label}</span>
            {t.id === 'members' && (
              <span className="fam-tab-count">{members.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Nội dung Tab */}
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

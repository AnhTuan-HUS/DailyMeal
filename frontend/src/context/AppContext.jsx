import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { initialIngredients, familyMembers, initialMealProfile, initialHistory, dishes } from '@/data/dishes'

const AppContext = createContext(null)

const NOTIF_STORAGE_KEY = 'dm_notifications_v1'

const SEED_NOTIFICATIONS = [
  {
    id: 101,
    category: 'meal',
    title: 'Đến giờ chuẩn bị bữa cơm rồi!',
    message: 'Thực đơn hôm nay có Cá hồi áp chảo sốt bơ chanh và Canh bí đỏ nấu tôm (tổng 35 phút).',
    time: '15 phút trước',
    read: false,
    targetPage: 'cook',
    actionLabel: 'Vào bếp ngay',
  },
  {
    id: 102,
    category: 'shopping',
    title: 'Giỏ đi chợ còn nguyên liệu cần mua',
    message: 'Đừng quên ghé chợ mua Cá hồi phi lê, Bông cải xanh và Tôm tươi cho thực đơn tuần này.',
    time: '1 giờ trước',
    read: false,
    targetPage: 'shopping',
    actionLabel: 'Mở giỏ đi chợ',
  },
  {
    id: 103,
    category: 'fridge',
    title: 'Cảnh báo tủ lạnh: Cứu thực phẩm sắp hết hạn',
    message: 'Trứng gà và Đậu hũ non trong tủ lạnh nên dùng trong 24h tới. Xem ngay gợi ý món ngon!',
    time: '3 giờ trước',
    read: false,
    targetPage: 'shopping',
    actionLabel: 'Cứu tủ lạnh',
  },
  {
    id: 104,
    category: 'family',
    title: 'Cập nhật lưu ý khẩu vị gia đình',
    message: 'Hệ thống đã tự động lọc các món có Đậu phộng để bảo vệ an toàn dị ứng cho Bé Bắp.',
    time: 'Hôm qua',
    read: true,
    targetPage: 'family',
    actionLabel: 'Xem hồ sơ gia đình',
  },
  {
    id: 105,
    category: 'plan',
    title: 'Thực đơn 7 ngày đã cân bằng dinh dưỡng',
    message: 'Thực đơn tuần này đạt 92% mục tiêu cân bằng đạm - rau xanh và giảm mặn cho Ông Nội.',
    time: '2 ngày trước',
    read: true,
    targetPage: 'plan',
    actionLabel: 'Xem thực đơn tuần',
  },
]

function loadInitialNotifications() {
  try {
    const raw = localStorage.getItem(NOTIF_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {
    // ignore storage parse error
  }
  return SEED_NOTIFICATIONS
}

export function AppProvider({ children }) {
  const [saved, setSaved] = useState(new Set([2, 4]))
  const [ingredients, setIngredients] = useState(initialIngredients)
  const [checked, setChecked] = useState(new Set())
  const [members, setMembers] = useState(familyMembers)
  const [mealProfile, setMealProfile] = useState(initialMealProfile)
  const [history, setHistory] = useState(initialHistory)
  const [notifications, setNotifications] = useState(loadInitialNotifications)

  useEffect(() => {
    try {
      localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifications))
    } catch {
      // ignore quota error
    }
  }, [notifications])

  const pushNotification = useCallback(({ category = 'system', title, message, targetPage = 'home', actionLabel = 'Xem chi tiết' }) => {
    setNotifications(prev => [
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        category,
        title,
        message,
        time: 'Vừa xong',
        read: false,
        targetPage,
        actionLabel,
      },
      ...prev,
    ])
  }, [])

  const markNotificationRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const resetNotifications = useCallback(() => {
    setNotifications(SEED_NOTIFICATIONS)
  }, [])

  const toggleSave = useCallback((id) => {
    setSaved(prev => {
      const next = new Set(prev)
      const isRemoving = next.has(id)
      if (isRemoving) next.delete(id)
      else {
        next.add(id)
        const dish = dishes.find(d => d.id === id)
        if (dish) {
          pushNotification({
            category: 'meal',
            title: `Đã lưu món "${dish.name}"`,
            message: `Món ăn đã được thêm vào Bộ sưu tập yêu thích (${dish.time} • ${dish.cal}).`,
            targetPage: 'saved',
            actionLabel: 'Xem món đã lưu',
          })
        }
      }
      return next
    })
  }, [pushNotification])

  const checkIngredient = useCallback((idx, val) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (val) next.add(idx)
      else next.delete(idx)
      return next
    })
  }, [])

  const addIngredient = useCallback((name, qty = '1 phần') => {
    setIngredients(prev => [...prev, [name, qty]])
    pushNotification({
      category: 'shopping',
      title: 'Đã thêm nguyên liệu vào giỏ đi chợ',
      message: `Đã bổ sung "${name}" (${qty}) vào danh sách cần mua.`,
      targetPage: 'shopping',
      actionLabel: 'Xem giỏ đi chợ',
    })
  }, [pushNotification])

  const removeIngredient = useCallback((idx) => {
    setIngredients(prev => prev.filter((_, i) => i !== idx))
    setChecked(prev => {
      const next = new Set()
      prev.forEach(i => { if (i < idx) next.add(i); else if (i > idx) next.add(i - 1) })
      return next
    })
  }, [])

  const clearChecked = useCallback(() => {
    setIngredients(prev => prev.filter((_, i) => !checked.has(i)))
    setChecked(new Set())
  }, [checked])

  // ---- Gia đình ----
  const addMember = useCallback((data) => {
    setMembers(prev => [...prev, { ...data, id: Date.now() }])
    pushNotification({
      category: 'family',
      title: `Đã thêm thành viên ${data.name}`,
      message: 'Hồ sơ khẩu vị và dị ứng của gia đình đã được cập nhật cho thực đơn tuần.',
      targetPage: 'family',
      actionLabel: 'Xem gia đình',
    })
  }, [pushNotification])

  const updateMember = useCallback((id, data) => {
    setMembers(prev => prev.map(m => (m.id === id ? { ...m, ...data } : m)))
  }, [])

  const removeMember = useCallback((id) => {
    setMembers(prev => prev.filter(m => m.id !== id))
  }, [])

  const updateMealProfile = useCallback((patch) => {
    setMealProfile(prev => ({ ...prev, ...patch }))
  }, [])

  const setHistoryStatus = useCallback((daysAgo, status, swappedTo) => {
    setHistory(prev =>
      prev.map(h =>
        h.daysAgo === daysAgo
          ? { ...h, status, swappedTo: status === 'swapped' ? swappedTo : undefined }
          : h
      )
    )
  }, [])

  return (
    <AppContext.Provider
      value={{
        saved, toggleSave,
        ingredients, checked, checkIngredient, addIngredient, removeIngredient, clearChecked,
        members, addMember, updateMember, removeMember,
        mealProfile, updateMealProfile,
        history, setHistoryStatus,
        notifications,
        pushNotification,
        markNotificationRead,
        markAllNotificationsRead,
        removeNotification,
        clearAllNotifications,
        resetNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// oxlint-disable-next-line react/only-export-components
export function useApp() {
  return useContext(AppContext)
}

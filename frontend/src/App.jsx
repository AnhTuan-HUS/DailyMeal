import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-gray-800">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">DailyMeal</h1>
        <p className="text-sm text-gray-500 mb-6">Default React + Vite + Tailwind CSS Starter</p>
        <button
          onClick={() => setCount((c) => c + 1)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
        >
          Count: {count}
        </button>
      </div>
    </div>
  )
}

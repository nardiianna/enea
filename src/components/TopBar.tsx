import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function TopBar({ title }: { title: string }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-3">
      <div className="flex items-center gap-2">
        <img src="/icon-32.png" alt="" className="w-6 h-6" />
        <h1 className="text-base font-semibold">{title}</h1>
      </div>
      <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
        Esci
      </button>
    </header>
  )
}

import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { LayoutDashboard, Users, Filter, LogOut } from 'lucide-react'
import ClientView from './ClientView'
import FilterCRUD from './FilterCRUD'
import Auth from './Auth'

// --- COMPONENTE DASHBOARD (con datos reales) ---
function Dashboard({ session }) {
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      // Si no hay sesión, no hacemos nada
      if (!session) return

      const { data, error } = await supabase
        .from('clients')
        .select('status')
        .eq('user_id', session.user.id)
      
      if (error) console.error('Error cargando stats:', error)
      else {
        const total = data?.length || 0
        const active = data?.filter(c => c.status === 'active').length || 0
        const pending = data?.filter(c => c.status === 'pending').length || 0
        
        setStats({ total, active, pending })
      }
      setLoading(false)
    }

    fetchStats()
  }, [session])

  if (loading) return <div className="p-6">Cargando estadísticas...</div>

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-500 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium">Clientes Totales</h3>
          <p className="text-4xl font-bold mt-2">{stats.total}</p>
        </div>
        <div className="bg-emerald-500 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium">Activos</h3>
          <p className="text-4xl font-bold mt-2">{stats.active}</p>
        </div>
        <div className="bg-orange-500 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium">Pendientes</h3>
          <p className="text-4xl font-bold mt-2">{stats.pending}</p>
        </div>
      </div>
    </div>
  )
}

// --- COMPONENTE PRINCIPAL APP ---
export default function App() {
  const [session, setSession] = useState(null)
  const [view, setView] = useState('dashboard')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    supabase.auth.onAuthStateChange((_event, session) => setSession(session))
  }, [])

  // Si no hay sesión, mostramos el Login
  if (!session) return <Auth onLogin={() => supabase.auth.getSession().then(({ data: { session } }) => setSession(session))} />

  // Si hay sesión, mostramos la App
  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar Lateral */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-blue-600">️ Cloudnotes</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setView('dashboard')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'dashboard' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => setView('clients')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'clients' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Users size={20} /> Clientes
          </button>
          <button 
            onClick={() => setView('filters')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${view === 'filters' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Filter size={20} /> Filtros
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <LogOut size={20} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-700 capitalize">{view}</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{session.user.email}</span>
          </div>
        </header>

        <div className="p-6">
          {/* AQUÍ ESTÁ EL ARREGLO: Le pasamos session={session} al Dashboard */}
          {view === 'dashboard' && <Dashboard session={session} />}
          {view === 'clients' && <ClientView session={session} />}
          {view === 'filters' && <FilterCRUD session={session} />}
        </div>
      </main>
    </div>
  )
}
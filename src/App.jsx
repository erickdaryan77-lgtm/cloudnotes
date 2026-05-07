import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { LayoutDashboard, Users, Filter, LogOut } from 'lucide-react'
import ClientView from './ClientView'
import FilterCRUD from './FilterCRUD'
import Auth from './Auth'

function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-500 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium">Clientes Totales</h3>
          <p className="text-4xl font-bold mt-2">--</p>
        </div>
        <div className="bg-emerald-500 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium">Activos</h3>
          <p className="text-4xl font-bold mt-2">--</p>
        </div>
        <div className="bg-orange-500 text-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-medium">Pendientes</h3>
          <p className="text-4xl font-bold mt-2">--</p>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [view, setView] = useState('dashboard')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session))
    supabase.auth.onAuthStateChange((_event, session) => setSession(session))
  }, [])

  if (!session) return <Auth onLogin={() => supabase.auth.getSession().then(({ data: { session } }) => setSession(session))} />

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-blue-600">☁️ Cloudnotes</h1>
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

      <main className="flex-1 overflow-auto">
        <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-700 capitalize">{view}</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{session.user.email}</span>
          </div>
        </header>

        <div className="p-6">
          {view === 'dashboard' && <Dashboard />}
          {view === 'clients' && <ClientView session={session} />}
          {view === 'filters' && <FilterCRUD session={session} />}
        </div>
      </main>
    </div>
  )
}
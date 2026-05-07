import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { LayoutDashboard, Users, Filter, LogOut, TrendingUp, Activity, PieChart } from 'lucide-react'
import ClientView from './ClientView'
import FilterCRUD from './FilterCRUD'
import Auth from './Auth'

function Dashboard({ session }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!session) return
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
      
      setClients(data || [])
      setLoading(false)
    }
    fetchData()
  }, [session])

  // Métricas calculadas
  const total = clients.length
  const active = clients.filter(c => c.status === 'active').length
  const pending = clients.filter(c => c.status === 'pending').length
  const inactive = clients.filter(c => c.status === 'inactive').length
  
  const pctActive = total > 0 ? Math.round((active / total) * 100) : 0
  const pctPending = total > 0 ? Math.round((pending / total) * 100) : 0
  const pctInactive = total > 0 ? Math.round((inactive / total) * 100) : 0

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-500 mt-1">Métricas y análisis de tu negocio</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
          <Activity className="text-blue-600" size={20} />
          <span className="text-blue-700 font-semibold">Tiempo Real</span>
        </div>
      </div>

      {/* TARJETAS PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Users className="opacity-80" size={28} />
            <span className="bg-white/20 px-2 py-1 rounded text-xs">Total</span>
          </div>
          <p className="text-4xl font-bold">{total}</p>
          <p className="text-blue-100 text-sm mt-2">Clientes registrados</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="opacity-80" size={28} />
            <span className="bg-white/20 px-2 py-1 rounded text-xs">{pctActive}%</span>
          </div>
          <p className="text-4xl font-bold">{active}</p>
          <p className="text-emerald-100 text-sm mt-2">Clientes activos</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Activity className="opacity-80" size={28} />
            <span className="bg-white/20 px-2 py-1 rounded text-xs">{pctPending}%</span>
          </div>
          <p className="text-4xl font-bold">{pending}</p>
          <p className="text-orange-100 text-sm mt-2">Pendientes</p>
        </div>

        <div className="bg-gradient-to-br from-slate-600 to-slate-700 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <PieChart className="opacity-80" size={28} />
            <span className="bg-white/20 px-2 py-1 rounded text-xs">{pctInactive}%</span>
          </div>
          <p className="text-4xl font-bold">{inactive}</p>
          <p className="text-slate-300 text-sm mt-2">Inactivos</p>
        </div>
      </div>

      {/* GRÁFICO DE BARRAS - DISTRIBUCIÓN */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <PieChart size={20} className="text-blue-600" />
          Distribución de Clientes
        </h3>
        
        <div className="space-y-6">
          {/* Barra Activos */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-slate-700 flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                Activos
              </span>
              <span className="font-bold text-emerald-600">{pctActive}% ({active} clientes)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${pctActive}%` }}
              ></div>
            </div>
          </div>

          {/* Barra Pendientes */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-slate-700 flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                Pendientes
              </span>
              <span className="font-bold text-orange-600">{pctPending}% ({pending} clientes)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-orange-500 to-orange-400 h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${pctPending}%` }}
              ></div>
            </div>
          </div>

          {/* Barra Inactivos */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium text-slate-700 flex items-center gap-2">
                <span className="w-3 h-3 bg-slate-500 rounded-full"></span>
                Inactivos
              </span>
              <span className="font-bold text-slate-600">{pctInactive}% ({inactive} clientes)</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-slate-500 to-slate-400 h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${pctInactive}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* TABLA DE ÚLTIMOS CLIENTES */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Últimos Clientes Registrados</h3>
        </div>
        
        {clients.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users size={48} className="mx-auto mb-3 opacity-50" />
            <p>No hay clientes registrados aún</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-4 font-semibold text-slate-700">Cliente</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Email</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Estado</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Notas</th>
                  <th className="text-left p-4 font-semibold text-slate-700">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.slice(0, 5).map(client => (
                  <tr key={client.id} className="hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800">{client.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">{client.email || '-'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        client.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        client.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {client.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 text-sm max-w-xs truncate">
                      {client.notes || 'Sin notas'}
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      {new Date(client.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// --- APP PRINCIPAL ---
export default function App() {
  const [session, setSession] = useState(null)
  const [view, setView] = useState('dashboard')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    supabase.auth.onAuthStateChange((_event, session) => setSession(session))
  }, [])

  if (!session) {
    return <Auth onLogin={() => {
      supabase.auth.getSession().then(({ data }) => setSession(data.session))
    }} />
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            ☁️ Cloudnotes
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setView('dashboard')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              view === 'dashboard' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => setView('clients')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              view === 'clients' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Users size={20} /> Clientes
          </button>
          <button 
            onClick={() => setView('filters')} 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              view === 'filters' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-slate-600 hover:bg-slate-50'
            }`}
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

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-slate-700 capitalize">{view}</h2>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
              {session.user.email[0].toUpperCase()}
            </div>
            <span className="text-sm text-slate-600 hidden sm:block">{session.user.email}</span>
          </div>
        </header>

        <div className="bg-slate-50 min-h-full pb-10">
          {view === 'dashboard' && <Dashboard session={session} />}
          {view === 'clients' && <ClientView session={session} />}
          {view === 'filters' && <FilterCRUD session={session} />}
        </div>
      </main>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { LayoutDashboard, Users, Filter, LogOut, TrendingUp, Activity, Zap, Sparkles } from 'lucide-react'
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

  const total = clients.length
  const active = clients.filter(c => c.status === 'active').length
  const pending = clients.filter(c => c.status === 'pending').length
  const inactive = clients.filter(c => c.status === 'inactive').length
  
  const pctActive = total > 0 ? Math.round((active / total) * 100) : 0
  const pctPending = total > 0 ? Math.round((pending / total) * 100) : 0
  const pctInactive = total > 0 ? Math.round((inactive / total) * 100) : 0

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin" style={{animationDuration: '1.5s'}}></div>
      </div>
    </div>
  )

  // NOTA: Aquí quitamos el div 'fixed inset-0' que tapaba el menú
  return (
    <div className="space-y-6 max-w-7xl mx-auto relative z-10">
      
      {/* HEADER CON EFECTO NEON */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-pulse">
            Dashboard
          </h2>
          <p className="text-slate-400 mt-2 flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-400" />
            Métricas en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900/50 backdrop-blur-xl px-6 py-3 rounded-2xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
          <Zap className="text-yellow-400 animate-pulse" size={24} />
          <span className="text-cyan-400 font-bold">LIVE</span>
        </div>
      </div>

      {/* TARJETAS FUTURISTAS CON GLASSMORPHISM */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="group relative bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 p-6 rounded-3xl hover:scale-105 transition-all duration-300 hover:shadow-[0_0_40px_rgba(6,182,212,0.5)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Users className="text-cyan-400" size={32} />
              <span className="bg-cyan-500/20 text-cyan-300 px-3 py-1 rounded-full text-xs border border-cyan-500/30">Total</span>
            </div>
            <p className="text-5xl font-black text-white mb-2">{total}</p>
            <p className="text-cyan-300 text-sm">Clientes registrados</p>
          </div>
        </div>

        <div className="group relative bg-slate-900/60 backdrop-blur-xl border border-emerald-500/30 p-6 rounded-3xl hover:scale-105 transition-all duration-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="text-emerald-400" size={32} />
              <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs border border-emerald-500/30">{pctActive}%</span>
            </div>
            <p className="text-5xl font-black text-white mb-2">{active}</p>
            <p className="text-emerald-300 text-sm">Activos</p>
          </div>
        </div>

        <div className="group relative bg-slate-900/60 backdrop-blur-xl border border-orange-500/30 p-6 rounded-3xl hover:scale-105 transition-all duration-300 hover:shadow-[0_0_40px_rgba(249,115,22,0.5)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Activity className="text-orange-400" size={32} />
              <span className="bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-xs border border-orange-500/30">{pctPending}%</span>
            </div>
            <p className="text-5xl font-black text-white mb-2">{pending}</p>
            <p className="text-orange-300 text-sm">Pendientes</p>
          </div>
        </div>

        <div className="group relative bg-slate-900/60 backdrop-blur-xl border border-purple-500/30 p-6 rounded-3xl hover:scale-105 transition-all duration-300 hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <Zap className="text-purple-400" size={32} />
              <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs border border-purple-500/30">{pctInactive}%</span>
            </div>
            <p className="text-5xl font-black text-white mb-2">{inactive}</p>
            <p className="text-purple-300 text-sm">Inactivos</p>
          </div>
        </div>
      </div>

      {/* GRÁFICOS DE BARRAS NEON */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 mb-6 shadow-2xl">
        <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <Activity className="text-cyan-400" size={28} />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Distribución de Clientes
          </span>
        </h3>
        
        <div className="space-y-8">
          {[
            { label: 'Activos', count: active, pct: pctActive, color: 'from-emerald-500 to-emerald-400', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.6)]' },
            { label: 'Pendientes', count: pending, pct: pctPending, color: 'from-orange-500 to-orange-400', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.6)]' },
            { label: 'Inactivos', count: inactive, pct: pctInactive, color: 'from-slate-500 to-slate-400', glow: 'shadow-[0_0_20px_rgba(100,116,139,0.6)]' }
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between mb-3">
                <span className="text-slate-300 font-semibold flex items-center gap-3">
                  <span className={`w-4 h-4 bg-gradient-to-r ${item.color} rounded-full shadow-lg`}></span>
                  {item.label}
                </span>
                <span className={`font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                  {item.pct}% ({item.count} clientes)
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-6 overflow-hidden border border-slate-700">
                <div 
                  className={`bg-gradient-to-r ${item.color} h-6 rounded-full transition-all duration-1000 ease-out ${item.glow}`}
                  style={{ width: `${item.pct}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TABLA FUTURISTA */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 to-slate-800">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="text-purple-400" size={24} />
            Últimos Clientes
          </h3>
        </div>
        
        {clients.length === 0 ? (
          <div className="p-16 text-center">
            <Users size={64} className="mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 text-lg">No hay clientes registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/80">
                <tr>
                  <th className="text-left p-5 font-bold text-slate-300">Cliente</th>
                  <th className="text-left p-5 font-bold text-slate-300">Email</th>
                  <th className="text-left p-5 font-bold text-slate-300">Estado</th>
                  <th className="text-left p-5 font-bold text-slate-300">Notas</th>
                  <th className="text-left p-5 font-bold text-slate-300">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {clients.slice(0, 5).map((client, idx) => (
                  <tr key={client.id} className="hover:bg-slate-800/50 transition-all group">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-white">{client.name}</span>
                      </div>
                    </td>
                    <td className="p-5 text-slate-400">{client.email || '-'}</td>
                    <td className="p-5">
                      <span className={`px-4 py-2 rounded-full text-xs font-bold border ${
                        client.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.4)]' :
                        client.status === 'pending' ? 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.4)]' :
                        'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                      }`}>
                        {client.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-5 text-slate-400 text-sm max-w-xs truncate">{client.notes || '-'}</td>
                    <td className="p-5 text-slate-500 text-sm font-mono">
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

// --- APP PRINCIPAL CON SIDEBAR FUTURISTA ---
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
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar Futurista - Z-INDEX ALTO PARA QUE NO SE CUBRA */}
      <aside className="w-72 bg-slate-900/80 backdrop-blur-xl border-r border-slate-700/50 flex flex-col shadow-2xl z-50 relative">
        <div className="p-8 border-b border-slate-700/50">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center gap-3">
            ☁️ Cloudnotes
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-3">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'clients', icon: Users, label: 'Clientes' },
            { id: 'filters', icon: Filter, label: 'Filtros' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                view === item.id 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <item.icon size={22} className={view === item.id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-400 hover:bg-red-500/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-300 border border-transparent hover:border-red-500/30"
          >
            <LogOut size={22} />
            <span className="font-semibold">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content - CON EL FONDO AQUÍ */}
      <main className="flex-1 overflow-auto relative">
        
        {/* FONDO CON GRID FUTURISTA (AHORA SOLO EN EL MAIN) */}
        <div className="absolute inset-0 bg-slate-950 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-pink-500/10"></div>
        </div>

        <header className="bg-slate-900/60 backdrop-blur-xl p-6 border-b border-slate-700/50 flex justify-between items-center sticky top-0 z-20">
          <h2 className="text-2xl font-bold text-white capitalize">{view}</h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
              {session.user.email[0].toUpperCase()}
            </div>
            <span className="text-slate-300 text-sm hidden sm:block">{session.user.email}</span>
          </div>
        </header>

        <div className="p-6 relative z-10">
          {view === 'dashboard' && <Dashboard session={session} />}
          {view === 'clients' && <ClientView session={session} />}
          {view === 'filters' && <FilterCRUD session={session} />}
        </div>
      </main>
    </div>
  )
}
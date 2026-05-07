import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Filter, Search, Calendar, Tag, Trash2, Edit, Save, X, ChevronDown, Sliders, Sparkles, Database, Users, Eye, EyeOff, RotateCcw } from 'lucide-react'

export default function FilterCRUD({ session }) {
  const [filters, setFilters] = useState([])
  const [allClients, setAllClients] = useState([])
  const [displayedClients, setDisplayedClients] = useState([])
  const [showClients, setShowClients] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [activeFilter, setActiveFilter] = useState(null)
  
  const [formData, setFormData] = useState({
    name: '', status: 'all', dateFrom: '', dateTo: '', 
    searchName: '', searchEmail: '', sortBy: 'created_at', sortOrder: 'desc'
  })

  const quickFilters = [
    { id: 'today', name: 'Hoy', icon: Calendar, color: 'cyan' },
    { id: 'week', name: 'Esta Semana', icon: Calendar, color: 'blue' },
    { id: 'month', name: 'Este Mes', icon: Calendar, color: 'purple' },
    { id: 'active', name: 'Solo Activos', icon: Filter, color: 'emerald' },
    { id: 'pending', name: 'Pendientes', icon: Filter, color: 'orange' },
  ]

  useEffect(() => { 
    loadClients()
    loadFilters()
  }, [session])

  const loadClients = async () => {
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    setAllClients(data || [])
    setDisplayedClients(data || []) // Mostrar todos al inicio
  }

  const loadFilters = async () => {
    const { data } = await supabase
      .from('filters')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    setFilters(data || [])
    setLoading(false)
  }

  // 🔥 FUNCIÓN QUE REALMENTE FILTRA LOS DATOS
  const applyQuickFilter = (type) => {
    setActiveFilter(type)
    let filtered = [...allClients]
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch(type) {
      case 'today':
        filtered = filtered.filter(c => new Date(c.created_at) >= today)
        break
      case 'week':
        const weekAgo = new Date(today)
        weekAgo.setDate(today.getDate() - 7)
        filtered = filtered.filter(c => new Date(c.created_at) >= weekAgo)
        break
      case 'month':
        const monthAgo = new Date(today)
        monthAgo.setMonth(today.getMonth() - 1)
        filtered = filtered.filter(c => new Date(c.created_at) >= monthAgo)
        break
      case 'active':
        filtered = filtered.filter(c => c.status === 'active')
        break
      case 'pending':
        filtered = filtered.filter(c => c.status === 'pending')
        break
      default:
        break
    }
    setDisplayedClients(filtered)
  }

  const clearFilter = () => {
    setActiveFilter(null)
    setDisplayedClients(allClients)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { error } = editingId
      ? await supabase.from('filters').update(formData).eq('id', editingId)
      : await supabase.from('filters').insert([{ ...formData, user_id: session.user.id }])
    
    if (!error) {
      setShowModal(false)
      setEditingId(null)
      setFormData({ name: '', status: 'all', dateFrom: '', dateTo: '', searchName: '', searchEmail: '', sortBy: 'created_at', sortOrder: 'desc' })
      loadFilters()
    } else {
      alert('Error: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este filtro guardado?')) {
      await supabase.from('filters').delete().eq('id', id)
      loadFilters()
    }
  }

  const getGradientColor = (color) => {
    const gradients = {
      cyan: 'from-cyan-500 to-blue-600',
      blue: 'from-blue-500 to-indigo-600',
      purple: 'from-purple-500 to-pink-600',
      emerald: 'from-emerald-500 to-teal-600',
      orange: 'from-orange-500 to-red-600'
    }
    return gradients[color] || gradients.cyan
  }

  return (
    <div className="space-y-6 relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Centro de Filtros
          </h3>
          <p className="text-slate-400 mt-1">Filtra y gestiona tus datos</p>
        </div>
        <div className="flex gap-3">
          {activeFilter && (
            <button 
              onClick={clearFilter}
              className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 px-5 py-3 rounded-xl flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] font-semibold"
            >
              <RotateCcw size={18} /> Limpiar Filtro
            </button>
          )}
          <button 
            onClick={() => setShowClients(!showClients)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all border border-slate-700"
          >
            {showClients ? <EyeOff size={20} /> : <Eye size={20} />}
            {showClients ? 'Ocultar Clientes' : `Ver Clientes (${allClients.length})`}
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 font-bold"
          >
            <Sliders size={20} /> Nuevo Filtro
          </button>
        </div>
      </div>

      {/* Sección de Clientes Filtrados */}
      {showClients && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.2)]">
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 flex justify-between items-center">
            <div>
              <h4 className="text-xl font-bold text-white flex items-center gap-3">
                <Users className="text-cyan-400" size={24} />
                Clientes {activeFilter ? `Filtrados: ${quickFilters.find(f => f.id === activeFilter)?.name}` : '(Todos)'}
              </h4>
              <p className="text-slate-400 text-sm mt-1">Mostrando {displayedClients.length} de {allClients.length} registros</p>
            </div>
          </div>
          
          {displayedClients.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Filter className="mx-auto h-12 w-12 mb-4 opacity-50 text-slate-500" />
              <p>No hay clientes que coincidan con este filtro</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {displayedClients.map(client => (
                <div key={client.id} className="bg-slate-950/50 border border-slate-700/50 rounded-xl p-4 hover:border-cyan-500/50 transition-all group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                        {client.name[0]}
                      </div>
                      <div>
                        <h5 className="font-bold text-white">{client.name}</h5>
                        <p className="text-xs text-slate-400">{client.email || 'Sin email'}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      client.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' :
                      client.status === 'pending' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50' :
                      'bg-red-500/20 text-red-400 border border-red-500/50'
                    }`}>
                      {client.status}
                    </span>
                  </div>
                  {client.notes && (
                    <p className="text-xs text-slate-500 italic mt-2 line-clamp-2">"{client.notes}"</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filtros Rápidos */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6">
        <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="text-yellow-400" size={20} />
          Filtros Rápidos
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => applyQuickFilter(filter.id)}
              className={`group relative overflow-hidden bg-slate-800/50 hover:bg-slate-800 border-2 rounded-2xl p-4 transition-all duration-300 hover:scale-105 ${
                activeFilter === filter.id 
                  ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] bg-slate-800' 
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${getGradientColor(filter.color)} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <filter.icon className={`w-8 h-8 mb-2 mx-auto ${activeFilter === filter.id ? 'text-cyan-400' : 'text-slate-400 group-hover:text-white'} transition-colors`} />
              <p className={`text-sm font-semibold ${activeFilter === filter.id ? 'text-cyan-400' : 'text-slate-300 group-hover:text-white'}`}>
                {filter.name}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Filtros Guardados */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 to-slate-800">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <Database className="text-cyan-400" size={24} />
            Filtros Personalizados Guardados
          </h3>
          <p className="text-slate-400 text-sm mt-1">Total: {filters.length} filtro{filters.length !== 1 ? 's' : ''}</p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
            Cargando filtros...
          </div>
        ) : filters.length === 0 ? (
          <div className="p-16 text-center">
            <Filter className="mx-auto h-16 w-16 text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg">No hay filtros guardados</p>
            <p className="text-slate-500 text-sm mt-2">Crea tu primer filtro personalizado</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {filters.map((filter) => (
              <div key={filter.id} className="p-6 hover:bg-slate-800/50 transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                      <Filter size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-lg mb-2">{filter.name}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        {filter.status !== 'all' && (
                          <div className="bg-slate-950/50 px-3 py-2 rounded-lg border border-slate-700/50">
                            <span className="text-slate-400">Estado:</span>
                            <span className="text-cyan-400 font-semibold ml-2 capitalize">{filter.status}</span>
                          </div>
                        )}
                        {filter.dateFrom && (
                          <div className="bg-slate-950/50 px-3 py-2 rounded-lg border border-slate-700/50">
                            <span className="text-slate-400">Desde:</span>
                            <span className="text-purple-400 font-semibold ml-2">{new Date(filter.dateFrom).toLocaleDateString()}</span>
                          </div>
                        )}
                        {filter.dateTo && (
                          <div className="bg-slate-950/50 px-3 py-2 rounded-lg border border-slate-700/50">
                            <span className="text-slate-400">Hasta:</span>
                            <span className="text-purple-400 font-semibold ml-2">{new Date(filter.dateTo).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => { setFormData(filter); setEditingId(filter.id); setShowModal(true) }} className="p-3 bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 rounded-xl transition-all border border-slate-700 hover:border-cyan-500/50"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(filter.id)} className="p-3 bg-slate-800 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-slate-700 hover:border-red-500/50"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal (Mantenemos el mismo de antes para brevedad) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-6 border-b border-slate-700 sticky top-0">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sliders className="text-cyan-400" size={24} />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                  {editingId ? 'Editar Filtro' : 'Crear Nuevo Filtro'}
                </span>
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nombre del Filtro *</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-3.5 text-slate-500" size={20} />
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" placeholder="Ej: Clientes Activos Mes" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Estado</label>
                <div className="relative">
                  <Filter className="absolute left-4 top-3.5 text-slate-500" size={20} />
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-white pl-12 pr-10 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none appearance-none">
                    <option value="all">Todos</option><option value="active">Activo</option><option value="pending">Pendiente</option><option value="inactive">Inactivo</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-3.5 text-slate-500 pointer-events-none" size={20} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Fecha Desde</label>
                  <div className="relative"><Calendar className="absolute left-4 top-3.5 text-slate-500" size={20} /><input type="date" value={formData.dateFrom} onChange={e => setFormData({...formData, dateFrom: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" /></div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Fecha Hasta</label>
                  <div className="relative"><Calendar className="absolute left-4 top-3.5 text-slate-500" size={20} /><input type="date" value={formData.dateTo} onChange={e => setFormData({...formData, dateTo: e.target.value})} className="w-full bg-slate-950 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none" /></div>
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-all border border-slate-700 flex items-center justify-center gap-2"><X size={18} /> Cancelar</button>
                <button type="submit" className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2"><Save size={18} /> Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
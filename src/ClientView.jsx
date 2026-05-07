import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Plus, Trash2, Edit, Calendar, Mail, CheckCircle, XCircle, AlertCircle, User, FileText } from 'lucide-react'

export default function ClientView({ session }) {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', status: 'active', notes: '' })
  const [editingId, setEditingId] = useState(null)

  useEffect(() => { loadClients() }, [session])

  const loadClients = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { error } = editingId
      ? await supabase.from('clients').update(formData).eq('id', editingId)
      : await supabase.from('clients').insert([{ ...formData, user_id: session.user.id }])
    
    if (!error) {
      setShowModal(false)
      setEditingId(null)
      setFormData({ name: '', email: '', status: 'active', notes: '' })
      loadClients()
    } else {
      alert('Error: ' + error.message)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('¿Eliminar este cliente?')) {
      await supabase.from('clients').delete().eq('id', id)
      loadClients()
    }
  }

  const handleEdit = (client) => {
    setFormData(client)
    setEditingId(client.id)
    setShowModal(true)
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <CheckCircle className="text-emerald-400" size={18} />
      case 'inactive': return <XCircle className="text-red-400" size={18} />
      default: return <AlertCircle className="text-orange-400" size={18} />
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
      case 'inactive': return 'bg-red-500/20 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
      default: return 'bg-orange-500/20 text-orange-300 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-slate-400">Cargando clientes...</div>

  return (
    <div className="space-y-6 relative z-10">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
            Gestión de Clientes
          </h3>
          <p className="text-slate-400 mt-1">Administra tus contactos y notas</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData({ name: '', email: '', status: 'active', notes: '' }); setShowModal(true) }}
          className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] hover:scale-105 font-bold"
        >
          <Plus size={20} /> Nuevo Cliente
        </button>
      </div>

      {/* Grid de Clientes */}
      {clients.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 backdrop-blur-sm rounded-3xl border border-slate-700/50 border-dashed">
          <User className="mx-auto h-16 w-16 text-slate-600 mb-4" />
          <p className="text-slate-400 text-lg">No hay clientes aún.</p>
          <p className="text-slate-500 text-sm mt-2">Haz clic en "Nuevo Cliente" para agregar el primero.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(c => (
            <div key={c.id} className="group relative bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)] hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {c.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-lg">{c.name}</h4>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar size={12} /> {new Date(c.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(c.status)}`}>
                  {getStatusIcon(c.status)} {c.status}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {c.email && (
                  <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                    <Mail size={14} className="text-cyan-400" /> 
                    <span className="truncate">{c.email}</span>
                  </div>
                )}
                {c.notes && (
                  <div className="flex items-start gap-2 text-sm text-slate-400 bg-slate-800/30 p-3 rounded-lg border border-slate-700/30 italic">
                    <FileText size={14} className="text-purple-400 mt-0.5 shrink-0" /> 
                    <span>"{c.notes}"</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-700/50">
                <button 
                  onClick={() => handleEdit(c)} 
                  className="flex-1 bg-slate-800 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-slate-700 hover:border-cyan-500/50 font-semibold"
                >
                  <Edit size={16} /> Editar
                </button>
                <button 
                  onClick={() => handleDelete(c.id)} 
                  className="px-4 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all border border-slate-700 hover:border-red-500/50"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Futurista */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-md overflow-hidden animate-[fadeIn_0.3s_ease-out]">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-cyan-500/20 to-purple-500/20 p-6 border-b border-slate-700">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                {editingId ? <Edit className="text-cyan-400" /> : <Plus className="text-cyan-400" />}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                  {editingId ? 'Editar Cliente' : 'Nuevo Cliente'}
                </span>
              </h3>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-500" size={20} />
                  <input 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                    placeholder="Ej: Davivienda"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 text-slate-500" size={20} />
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="w-full bg-slate-950 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                    placeholder="cliente@ejemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Estado</label>
                <select 
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="pending">Pendiente</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Notas</label>
                <textarea 
                  rows="3" 
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})} 
                  className="w-full bg-slate-950 border border-slate-700 text-white px-4 py-3 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all resize-none placeholder:text-slate-600"
                  placeholder="Detalles adicionales..."
                ></textarea>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold transition-all border border-slate-700"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
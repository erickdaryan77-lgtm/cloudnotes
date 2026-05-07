import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Plus, Trash2, Edit, Calendar, Mail, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

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
      case 'active': return <CheckCircle className="text-emerald-500" size={18} />
      case 'inactive': return <XCircle className="text-red-500" size={18} />
      default: return <AlertCircle className="text-amber-500" size={18} />
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64">Cargando clientes...</div>

  return (
    <div>
      {/* Header con botón crear */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Gestión de Clientes</h3>
          <p className="text-slate-500 text-sm">Administra tus contactos y notas</p>
        </div>
        <button 
          onClick={() => { setEditingId(null); setFormData({ name: '', email: '', status: 'active', notes: '' }); setShowModal(true) }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-md"
        >
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      {/* Grid de Clientes */}
      {clients.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <p className="text-slate-400 text-lg">No hay clientes aún.</p>
          <p className="text-slate-400 text-sm">Haz clic en "Nuevo Cliente" para agregar el primero.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(c => (
            <div key={c.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition relative group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {c.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{c.name}</h4>
                    <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={10} /> {new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 bg-slate-50 rounded-full">
                  {getStatusIcon(c.status)} {c.status}
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm text-slate-600">
                {c.email && <div className="flex items-center gap-2"><Mail size={14} /> {c.email}</div>}
                {c.notes && <p className="text-slate-500 italic mt-2 bg-slate-50 p-2 rounded border border-slate-100">"{c.notes}"</p>}
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-50">
                <button onClick={() => handleEdit(c)} className="flex-1 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 py-2 rounded-lg text-sm transition flex items-center justify-center gap-1">
                  <Edit size={14} /> Editar
                </button>
                <button onClick={() => handleDelete(c.id)} className="px-3 bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg transition">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

                 {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 m-4">
            <h3 className="text-lg font-bold mb-4">{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="pending">Pendiente</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
                <textarea rows="3" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej: Cliente interesado..."></textarea>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg hover:bg-slate-200 transition">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
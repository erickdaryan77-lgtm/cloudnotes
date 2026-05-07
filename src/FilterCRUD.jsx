import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'

export default function FilterCRUD({ session }) {
  const [filters, setFilters] = useState([])
  const [name, setName] = useState('')
  const [criteria, setCriteria] = useState({ status: '' })
  const [editing, setEditing] = useState(null)

  useEffect(() => { loadFilters() }, [session])

  const loadFilters = async () => {
    const { data } = await supabase.from('filters').select('*').eq('user_id', session.user.id)
    setFilters(data || [])
  }

  const save = async () => {
    if (!name.trim()) return alert('Nombre requerido')
    const payload = { name, criteria, user_id: session.user.id }
    const { error } = editing
      ? await supabase.from('filters').update(payload).eq('id', editing)
      : await supabase.from('filters').insert([payload])
    if (!error) { setName(''); setCriteria({ status: '' }); setEditing(null); loadFilters() }
    else alert(error.message)
  }

  const remove = async (id) => {
    if (confirm('¿Eliminar filtro?')) {
      await supabase.from('filters').delete().eq('id', id)
      loadFilters()
    }
  }

  return (
    <div className="p-4 bg-white rounded-xl shadow mt-6">
      <h2 className="font-bold text-lg mb-3">Filtros guardados</h2>
      <div className="flex gap-2 mb-4">
        <input className="border p-2 rounded-lg flex-1" placeholder="Nombre del filtro" value={name} onChange={e => setName(e.target.value)} />
        <select className="border p-2 rounded-lg" value={criteria.status} onChange={e => setCriteria({...criteria, status: e.target.value})}>
          <option value="">Todos</option><option value="active">Activo</option><option value="inactive">Inactivo</option>
        </select>
        <button onClick={save} className="bg-blue-600 text-white px-4 rounded-lg">{editing ? 'Actualizar' : 'Guardar'}</button>
      </div>
      <ul className="space-y-2">
        {filters.map(f => (
          <li key={f.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
            <span className="font-medium">{f.name}</span>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(f.id); setName(f.name); setCriteria(f.criteria) }} className="text-blue-600 text-sm">Editar</button>
              <button onClick={() => remove(f.id)} className="text-red-600 text-sm">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
import { useState } from 'react'
import { supabase } from './lib/supabase'

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async (isLogin) => {
    setLoading(true)
    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    
    if (!error) onLogin()
    else alert(error.message)
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-4 max-w-xs mx-auto mt-24 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-center text-slate-800">☁️ Cloudnotes</h2>
      <input className="border p-3 rounded-lg outline-none" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="border p-3 rounded-lg outline-none" placeholder="Contraseña" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="bg-blue-600 text-white p-3 rounded-lg font-medium" disabled={loading} onClick={() => handleAuth(true)}>Iniciar sesión</button>
      <button className="bg-slate-200 p-3 rounded-lg font-medium" disabled={loading} onClick={() => handleAuth(false)}>Crear cuenta</button>
    </div>
  )
}
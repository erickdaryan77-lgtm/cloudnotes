import { useState } from 'react'
import { supabase } from './lib/supabase'
import { Mail, Lock, LogIn, UserPlus, Cloud } from 'lucide-react'

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true) // true = Login, false = Registro

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password })
    
    if (!error) onLogin()
    else alert(error.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden p-4">
      
      {/* FONDO ANIMADO FUTURISTA */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[120px]"></div>

      {/* CARD DE LOGIN */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
          
          {/* HEADER DEL FORMULARIO */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 p-8 border-b border-slate-700/50 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(6,182,212,0.5)] rotate-3 hover:rotate-12 transition-transform duration-500">
              <Cloud size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-2">
              Cloudnotes
            </h1>
            <p className="text-slate-400 text-sm">
              {isLogin ? 'Ingresa a tu panel de control' : 'Crea tu cuenta para comenzar'}
            </p>
          </div>

          {/* FORMULARIO */}
          <form onSubmit={handleAuth} className="p-8 space-y-6">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Correo Electrónico</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full bg-slate-950/50 border border-slate-700 text-white pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full bg-slate-950/50 border border-slate-700 text-white pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                  {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </>
              )}
            </button>

            {/* TOGGLE LOGIN/REGISTRO */}
            <div className="pt-4 border-t border-slate-700/50 text-center">
              <p className="text-slate-400 text-sm">
                {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-cyan-400 hover:text-cyan-300 font-bold ml-2 transition-colors"
                >
                  {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* FOOTER DECORATIVO */}
        <div className="mt-8 text-center text-slate-500 text-xs">
          <p>© 2026 Cloudnotes Inc. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}
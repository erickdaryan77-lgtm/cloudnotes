import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { User, Mail, Shield, Database, Activity, Trash2, Key, Calendar, LogOut } from 'lucide-react'

export default function Settings({ session }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile') // profile, users, security

  useEffect(() => {
    fetchUsers()
  }, [session])

  const fetchUsers = async () => {
    try {
      // Intentar obtener usuarios (nota: requiere permisos adecuados en Supabase)
      const { data: { users }, error } = await supabase.auth.admin.listUsers()
      
      if (error) {
        console.log('No se pudieron cargar todos los usuarios (permisos limitados)')
        // Fallback: mostrar solo el usuario actual
        setUsers([{ 
          id: session.user.id, 
          email: session.user.email, 
          created_at: session.user.created_at,
          last_sign_in_at: session.user.last_sign_in_at || session.user.created_at,
          isCurrentUser: true
        }])
      } else {
        // Marcar usuario actual
        const usersWithFlag = users.map(u => ({
          ...u,
          isCurrentUser: u.id === session.user.id
        }))
        setUsers(usersWithFlag)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
      setUsers([{ 
        id: session.user.id, 
        email: session.user.email, 
        created_at: session.user.created_at,
        last_sign_in_at: session.user.last_sign_in_at || session.user.created_at,
        isCurrentUser: true
      }])
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const stats = {
    totalUsers: users.length,
    currentUser: session.user.email,
    createdAt: new Date(session.user.created_at).toLocaleDateString(),
    lastSignIn: session.user.last_sign_in_at ? new Date(session.user.last_sign_in_at).toLocaleDateString() : 'N/A'
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
          Configuración
        </h2>
        <p className="text-slate-400 mt-1">Administra tu cuenta y usuarios del sistema</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-900/60 backdrop-blur-xl p-2 rounded-2xl border border-slate-700/50 w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'profile' 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <User size={18} /> Perfil
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'users' 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Database size={18} /> Usuarios ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'security' 
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Shield size={18} /> Seguridad
        </button>
      </div>

      {/* Contenido de las Tabs */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tarjeta de Perfil */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {session.user.email[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Tu Perfil</h3>
                <p className="text-slate-400">Información de tu cuenta</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="text-cyan-400" size={18} />
                  <span className="text-slate-400 text-sm">Correo Electrónico</span>
                </div>
                <p className="text-white font-semibold ml-9">{session.user.email}</p>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="text-purple-400" size={18} />
                  <span className="text-slate-400 text-sm">Fecha de Registro</span>
                </div>
                <p className="text-white font-semibold ml-9">{stats.createdAt}</p>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <Activity className="text-emerald-400" size={18} />
                  <span className="text-slate-400 text-sm">Último Ingreso</span>
                </div>
                <p className="text-white font-semibold ml-9">{stats.lastSignIn}</p>
              </div>

              <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-700/50">
                <div className="flex items-center gap-3 mb-2">
                  <Key className="text-orange-400" size={18} />
                  <span className="text-slate-400 text-sm">ID de Usuario</span>
                </div>
                <p className="text-white font-semibold ml-9 text-xs font-mono">{session.user.id}</p>
              </div>
            </div>
          </div>

          {/* Estadísticas Rápidas */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-6">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="text-cyan-400" size={20} />
                Estadísticas de Uso
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-lg">
                  <span className="text-slate-300">Total Clientes</span>
                  <span className="text-2xl font-bold text-cyan-400">--</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-lg">
                  <span className="text-slate-300">Filtros Guardados</span>
                  <span className="text-2xl font-bold text-purple-400">--</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSignOut}
              className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
            >
              <LogOut size={20} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-900 to-slate-800">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              <Database className="text-cyan-400" size={24} />
              Usuarios Registrados
            </h3>
            <p className="text-slate-400 text-sm mt-1">Total: {users.length} usuario{users.length !== 1 ? 's' : ''}</p>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto mb-4"></div>
              Cargando usuarios...
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {users.map((user) => (
                <div key={user.id} className={`p-6 flex items-center justify-between hover:bg-slate-800/50 transition-all ${user.isCurrentUser ? 'bg-cyan-500/5' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${
                      user.isCurrentUser ? 'bg-gradient-to-br from-cyan-500 to-purple-600' : 'bg-slate-700'
                    }`}>
                      {user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{user.email}</span>
                        {user.isCurrentUser && (
                          <span className="bg-cyan-500/20 text-cyan-300 text-xs px-2 py-1 rounded-full border border-cyan-500/30">
                            Tú
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Registrado: {new Date(user.created_at).toLocaleDateString()}
                        </span>
                        {user.last_sign_in_at && (
                          <span className="flex items-center gap-1">
                            <Activity size={12} />
                            Último acceso: {new Date(user.last_sign_in_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {user.isCurrentUser && (
                    <span className="text-emerald-400 text-sm font-semibold flex items-center gap-1">
                      <Shield size={16} /> Activo
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {users.length === 0 && !loading && (
            <div className="p-12 text-center text-slate-400">
              <User size={48} className="mx-auto mb-4 opacity-50" />
              <p>No hay usuarios registrados</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <Shield className="text-emerald-400" size={24} />
              Configuración de Seguridad
            </h3>
            
            <div className="space-y-4">
              <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-700/50">
                <h4 className="font-bold text-white mb-2">Cambiar Contraseña</h4>
                <p className="text-slate-400 text-sm mb-4">Actualiza tu contraseña de forma segura</p>
                <button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-all border border-slate-700">
                  Actualizar Contraseña
                </button>
              </div>

              <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-700/50">
                <h4 className="font-bold text-white mb-2">Autenticación de Dos Factores</h4>
                <p className="text-slate-400 text-sm mb-4">Protege tu cuenta con 2FA</p>
                <button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-semibold transition-all border border-slate-700 opacity-50 cursor-not-allowed">
                  Próximamente
                </button>
              </div>

              <div className="bg-red-500/10 p-6 rounded-xl border border-red-500/30">
                <h4 className="font-bold text-red-400 mb-2 flex items-center gap-2">
                  <Trash2 size={20} />
                  Zona de Peligro
                </h4>
                <p className="text-slate-400 text-sm mb-4">Eliminar tu cuenta permanentemente</p>
                <button className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 px-6 py-3 rounded-xl font-semibold transition-all">
                  Eliminar Cuenta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
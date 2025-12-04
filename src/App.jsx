import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Plus, 
  Search, 
  FileText, 
  Trash2, 
  Edit2, 
  Clock, 
  Users,
  X,
  Save,
  Filter,
  Download,
  Percent,
  Euro,
  Lock,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, // Login con contraseña
  signInWithCustomToken,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot
} from 'firebase/firestore';

// ------------------------------------------------------------------
// CONFIGURACIÓN DE FIREBASE (LÓGICA HÍBRIDA)
// ------------------------------------------------------------------

let firebaseConfig;
let appIdInternal = 'default-app-id'; // ID por defecto para uso local

// 1. INTENTO DE AUTODETECCIÓN (Para que funcione aquí en el chat)
try {
  if (typeof __firebase_config !== 'undefined') {
    firebaseConfig = JSON.parse(__firebase_config);
    if (typeof __app_id !== 'undefined') {
      appIdInternal = __app_id;
    }
  }
} catch (e) {
  console.log("Modo local detectado o error leyendo config del entorno");
}

// 2. CONFIGURACIÓN MANUAL (Para cuando lo uses en tu PC)
// Si no detectamos la config del chat, usamos la que tú pongas aquí:
if (!firebaseConfig) {
  firebaseConfig = {
  apiKey: "AIzaSyAtYmYvdn1keL9w4ZdCqqy1-wD6pZNTPZY",
  authDomain: "facturas-proveedores-f1370.firebaseapp.com",
  projectId: "facturas-proveedores-f1370",
  storageBucket: "facturas-proveedores-f1370.firebasestorage.app",
  messagingSenderId: "809234933664",
  appId: "1:809234933664:web:b9ded2a284f8eb8c53e6c5",
  measurementId: "G-D8XHLG01LD"
  };
}

// Inicialización de la App
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Componentes UI ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-amber-100 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", type = "button" }) => {
  const variants = {
    primary: "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-200",
    secondary: "bg-white hover:bg-amber-50 text-amber-900 border border-amber-200",
    danger: "bg-red-50 hover:bg-red-100 text-red-600 border border-red-200",
    ghost: "text-slate-500 hover:text-amber-600 hover:bg-amber-50"
  };
  return (
    <button type={type} onClick={onClick} className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const StatCard = ({ title, value, icon: Icon, subtext }) => (
  <Card className="p-6 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {subtext && <p className="text-xs text-amber-600 mt-2 font-medium">{subtext}</p>}
    </div>
    <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
      <Icon size={24} />
    </div>
  </Card>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-amber-50/50">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// --- Componente Login ---
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoggingIn(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // El onAuthStateChanged en el componente principal manejará el resto
    } catch (err) {
      console.error(err);
      setError("Email o contraseña incorrectos. Inténtalo de nuevo.");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden border border-amber-100">
        <div className="bg-amber-600 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <Lock className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Muebles Industria</h1>
          <p className="text-amber-100 text-sm">Acceso Privado al Dashboard</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Email Corporativo</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
              placeholder="nombre@mueblesindustria.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Contraseña</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoggingIn}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-amber-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoggingIn ? "Accediendo..." : "Entrar al Sistema"}
          </button>
        </form>
        <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-slate-100">
          Sistema protegido por Firebase Security
        </div>
      </div>
    </div>
  );
};

// --- Componente Principal ---
export default function MueblesIndustriaApp() {
  const [user, setUser] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true); // Loading inicial de auth
  const [dataLoading, setDataLoading] = useState(true); // Loading de datos
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Filtros
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  // Form State
  const [formData, setFormData] = useState({
    provider: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    dtoPP: '',
    dtoCom: '',
    notes: ''
  });

  // Autenticación Robusta
  useEffect(() => {
    const initAuth = async () => {
      // Si estamos en el chat, intentamos auto-login para preview
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try {
          await signInWithCustomToken(auth, __initial_auth_token);
        } catch (error) {
          console.error("Error auto-login chat:", error);
        }
      }
      // Si estamos en local/prod, NO hacemos nada y esperamos al form de login
      setLoading(false);
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Si hay usuario, empezamos a cargar datos
      } else {
        // Si no hay usuario, limpiamos datos
        setInvoices([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Carga de Datos (Solo si hay usuario)
  useEffect(() => {
    if (!user) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    let collectionPath;
    
    if (typeof __app_id !== 'undefined') {
       collectionPath = collection(db, 'artifacts', appIdInternal, 'users', user.uid, 'invoices');
    } else {
       // RUTA LOCAL (Producción)
       collectionPath = collection(db, 'users', user.uid, 'invoices');
    }
    
    const unsubscribe = onSnapshot(collectionPath, 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setInvoices(data);
        setDataLoading(false);
      },
      (error) => {
        console.error("Firestore error:", error);
        setDataLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Funciones de Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al salir:", error);
    }
  };

  // Cálculos y Lógica
  const stats = useMemo(() => {
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
    const totalDiscounts = invoices.reduce((acc, curr) => 
      acc + parseFloat(curr.dtoPP || 0) + parseFloat(curr.dtoCom || 0), 0
    );
    const uniqueProviders = new Set(invoices.map(i => i.provider)).size;
    return { totalInvoices, totalAmount, totalDiscounts, uniqueProviders };
  }, [invoices]);

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.provider.toLowerCase().includes(searchTerm.toLowerCase()) || inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesDate = true;
    if (dateRange.start) matchesDate = matchesDate && new Date(inv.date) >= new Date(dateRange.start);
    if (dateRange.end) matchesDate = matchesDate && new Date(inv.date) <= new Date(dateRange.end);
    return matchesSearch && matchesDate;
  });

  const currentViewTotals = useMemo(() => {
    return filteredInvoices.reduce((acc, curr) => ({
      amount: acc.amount + parseFloat(curr.amount || 0),
      dtoPP: acc.dtoPP + parseFloat(curr.dtoPP || 0),
      dtoCom: acc.dtoCom + parseFloat(curr.dtoCom || 0)
    }), { amount: 0, dtoPP: 0, dtoCom: 0 });
  }, [filteredInvoices]);

  // Manejadores de eventos
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    let collectionRef;
    if (typeof __app_id !== 'undefined') {
       collectionRef = collection(db, 'artifacts', appIdInternal, 'users', user.uid, 'invoices');
    } else {
       collectionRef = collection(db, 'users', user.uid, 'invoices');
    }

    try {
      if (editingId) {
        await updateDoc(doc(collectionRef, editingId), formData);
      } else {
        await addDoc(collectionRef, { ...formData, createdAt: new Date().toISOString() });
      }
      closeModal();
    } catch (error) { console.error("Error saving:", error); }
  };

  const handleDelete = async (id) => {
    if (!user || !window.confirm("¿Estás seguro de eliminar esta factura?")) return;
    
    let docRef;
    if (typeof __app_id !== 'undefined') {
       docRef = doc(db, 'artifacts', appIdInternal, 'users', user.uid, 'invoices', id);
    } else {
       docRef = doc(db, 'users', user.uid, 'invoices', id);
    }

    try { await deleteDoc(docRef); } 
    catch (error) { console.error("Error deleting:", error); }
  };

  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) return;
    const headers = ["Nº Factura", "Proveedor", "Fecha", "Importe Bruto", "Dto. Pronto Pago", "Dto. Comercial", "Notas"];
    const csvContent = [
      headers.join(','),
      ...filteredInvoices.map(row => [
        `"${row.invoiceNumber}"`, `"${row.provider}"`, row.date, row.amount, row.dtoPP || 0, row.dtoCom || 0, `"${row.notes || ''}"`
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `facturas_muebles_industria_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const openEditModal = (invoice) => {
    setFormData(invoice);
    setEditingId(invoice.id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setFormData({ provider: '', invoiceNumber: '', date: new Date().toISOString().split('T')[0], amount: '', dtoPP: '', dtoCom: '', notes: '' });
    setEditingId(null);
    setIsModalOpen(false);
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  const getAmountColor = (val) => parseFloat(val) < 0 ? 'text-red-600 font-bold' : '';

  // --- RENDERIZADO CONDICIONAL ---

  if (loading) return <div className="h-screen flex items-center justify-center text-amber-600 animate-pulse">Cargando Sistema...</div>;

  // Si no hay usuario logueado, mostramos el LOGIN
  if (!user) {
    return <LoginScreen />;
  }

  // Si hay usuario, mostramos el DASHBOARD
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <nav className="bg-white border-b border-amber-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 text-white p-2 rounded-lg shadow-sm"><LayoutDashboard size={20} /></div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Muebles Industria</h1>
              <p className="text-xs text-amber-600 font-medium">
                Hola, {user.email?.split('@')[0]}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden md:inline">Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Facturado" value={formatCurrency(stats.totalAmount)} icon={FileText} subtext="Acumulado anual" />
          <StatCard title="Total Descuentos" value={formatCurrency(stats.totalDiscounts)} icon={Percent} subtext="Dtp PP + Dto Com" />
          <StatCard title="Facturas Registradas" value={stats.totalInvoices} icon={FileText} />
          <StatCard title="Proveedores" value={stats.uniqueProviders} icon={Users} />
        </div>

        {/* Barra de Acciones y Filtros */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} className={showFilters ? 'bg-amber-50' : ''}><Filter size={18} /> Filtros</Button>
              <Button variant="secondary" onClick={handleExportCSV}><Download size={18} /> CSV</Button>
              <Button onClick={() => setIsModalOpen(true)}><Plus size={18} /> Nueva Factura</Button>
            </div>
          </div>
          
          {showFilters && (
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 flex items-end gap-4">
              <div className="space-y-1 w-full md:w-auto">
                <label className="text-xs font-medium text-slate-500">Fecha Inicio</label>
                <input type="date" value={dateRange.start} onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))} className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg" />
              </div>
              <div className="space-y-1 w-full md:w-auto">
                <label className="text-xs font-medium text-slate-500">Fecha Fin</label>
                <input type="date" value={dateRange.end} onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))} className="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg" />
              </div>
              <Button variant="ghost" onClick={() => setDateRange({start: '', end: ''})}>Limpiar</Button>
            </div>
          )}
        </div>

        {/* Tabla de Facturas */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase text-slate-500">
                  <th className="px-6 py-4 font-semibold">Nº Factura</th>
                  <th className="px-6 py-4 font-semibold">Proveedor</th>
                  <th className="px-6 py-4 font-semibold">Fecha</th>
                  <th className="px-6 py-4 font-semibold">Importe</th>
                  <th className="px-6 py-4 font-semibold">Dtp PP (€)</th>
                  <th className="px-6 py-4 font-semibold">Dto Com (€)</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataLoading ? (
                  <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">Cargando facturas...</td></tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">No hay datos</td></tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-amber-50/30 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-700">{inv.invoiceNumber}</td>
                      <td className="px-6 py-4 text-slate-600">{inv.provider}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{new Date(inv.date).toLocaleDateString('es-ES')}</td>
                      <td className={`px-6 py-4 font-medium ${getAmountColor(inv.amount)}`}>{formatCurrency(inv.amount)}</td>
                      <td className={`px-6 py-4 ${getAmountColor(inv.dtoPP)}`}>{inv.dtoPP ? formatCurrency(inv.dtoPP) : '-'}</td>
                      <td className={`px-6 py-4 ${getAmountColor(inv.dtoCom)}`}>{inv.dtoCom ? formatCurrency(inv.dtoCom) : '-'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(inv)} className="p-1.5 text-slate-400 hover:text-amber-600"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(inv.id)} className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Footer de Tabla con Totales */}
          {!dataLoading && filteredInvoices.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-2">
              <span>{filteredInvoices.length} facturas mostradas</span>
              <div className="flex flex-col md:flex-row gap-4 text-right">
                <span>Total Bruto: <strong className={getAmountColor(currentViewTotals.amount)}>{formatCurrency(currentViewTotals.amount)}</strong></span>
                <span className="text-amber-700">Total Dto PP: <strong className={getAmountColor(currentViewTotals.dtoPP)}>{formatCurrency(currentViewTotals.dtoPP)}</strong></span>
                <span className="text-amber-700">Total Dto Com: <strong className={getAmountColor(currentViewTotals.dtoCom)}>{formatCurrency(currentViewTotals.dtoCom)}</strong></span>
              </div>
            </div>
          )}
        </Card>
      </main>

      {/* Modal Formulario */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Editar Factura" : "Nueva Factura"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ... Mismo formulario de siempre ... */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-xs font-medium text-slate-500 uppercase">Nº Factura</label><input required type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div className="space-y-1"><label className="text-xs font-medium text-slate-500 uppercase">Fecha</label><input required type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" /></div>
          </div>
          <div className="space-y-1"><label className="text-xs font-medium text-slate-500 uppercase">Proveedor</label><input required type="text" name="provider" value={formData.provider} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div className="space-y-1"><label className="text-xs font-medium text-slate-500 uppercase">Importe Base (€)</label><input required type="number" step="0.01" name="amount" value={formData.amount} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-xs font-medium text-slate-500 uppercase">Dtp PP (€)</label><input type="number" step="0.01" name="dtoPP" value={formData.dtoPP} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" /></div>
            <div className="space-y-1"><label className="text-xs font-medium text-slate-500 uppercase">Dto Com (€)</label><input type="number" step="0.01" name="dtoCom" value={formData.dtoCom} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg" /></div>
          </div>
          <div className="pt-4 flex gap-3">
            <Button variant="secondary" onClick={closeModal} className="flex-1 justify-center">Cancelar</Button>
            <Button type="submit" className="flex-1 justify-center"><Save size={18} /> Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
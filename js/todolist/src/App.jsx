import React, { useState, useMemo } from 'react';
import { Check, Plus, LogOut, Trash2, Edit2, Calendar, Settings, X, Tag, Clock, LogIn } from 'lucide-react';




const BASE_URL = "http://localhost:8000";

const TodoListApp = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', label: '' });
  const [editingTask, setEditingTask] = useState(null);


  async function login(email, password) {
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", password);

    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });
    
    console.log("DEBUG " + res);
    if (!res.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await res.json();

    
    localStorage.setItem("access_token", data.access_token);
    
    return data;
  }

  async function register(name, email, password) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Register failed");
  }

  return await res.json();
}

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      setError("Preencha todos os campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const loginAuth = await login(loginData.email, loginData.password);

      console.log("LOGADO:", loginAuth);

      setUser({
        email: loginData.email,
        name: loginData.email.split("@")[0],
      });

      setCurrentView("tasks");
    } catch (err) {
      console.error(err);
      setError("Credenciais inválidas");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
  if (!registerData.name || !registerData.email || !registerData.password) {
    setError("Preencha todos os campos");
    return;
  }

  setLoading(true);
  setError("");

  try {
    await register(
      registerData.name,
      registerData.email,
      registerData.password
    );

  
    setCurrentView("login");
    setLoginData({ email: registerData.email, password: "" });
  } catch (err) {
    console.error(err);
    setError("Usuário já existe ou erro ao cadastrar");
  } finally {
    setLoading(false);
  }
};


  const handleLogout = () => {
    setUser(null);
    setTasks([]);
    setCurrentView('login');
    setLoginData({ email: '', password: '' });
    setShowSettings(false);
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim()) {
      setError('O título da tarefa é obrigatório');
      return;
    }
    const task = {
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.dueDate,
      label: newTask.label || 'Sem categoria',
      completed: false
    };
    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', dueDate: '', label: '' });
    setError('');
    setShowAddTask(false);
  };

  const handleUpdateTask = () => {
    setTasks(tasks.map(task => task.id === editingTask.id ? editingTask : task));
    setEditingTask(null);
  };

  const handleToggleTask = (taskId) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, completed: !task.completed } : task));
  };

  const handleDeleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    setDeleteConfirm(null);
  };

  const groupTasksByLabel = useMemo(() => {
    const activeTasks = tasks.filter(t => !t.completed);
    const groups = {};
    activeTasks.forEach(task => {
      const label = task.label || 'Sem categoria';
      if (!groups[label]) groups[label] = [];
      groups[label].push(task);
    });
    return groups;
  }, [tasks]);

  const completedTasks = useMemo(() => tasks.filter(t => t.completed), [tasks]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, percentage };
  }, [tasks]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  };

  const isOverdue = (dateString) => {
    if (!dateString) return false;
    const taskDate = new Date(dateString + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return taskDate < today;
  };

  if (currentView === 'login') {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4">
                <Check size={32} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">TodoList</h1>
              <p className="text-gray-400">Organize suas tarefas</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                <input type="email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" placeholder="seu@email.com" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Senha</label>
                <input type="password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" placeholder="••••••••" />
              </div>
              {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">{error}</div>}
              <button onClick={handleLogin} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
            <div className="mt-6 text-center">
              <button onClick={() => { setCurrentView('register'); setError(''); }} className="text-orange-400 hover:text-orange-300 transition-colors text-sm">
                Não tem conta? Cadastre-se
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'register') {
    return (
      <div className="w-screen h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4">
                <Check size={32} className="text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Criar Conta</h1>
              <p className="text-gray-400">Comece a organizar suas tarefas</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Nome</label>
                <input type="text" value={registerData.name} onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" placeholder="Seu nome" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
                <input type="email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" placeholder="seu@email.com" />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Senha</label>
                <input type="password" value={registerData.password} onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" placeholder="••••••••" />
              </div>
              {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">{error}</div>}
              <button onClick={handleRegister} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
            <div className="mt-6 text-center">
              <button onClick={() => { setCurrentView('login'); setError(''); }} className="text-orange-400 hover:text-orange-300 transition-colors text-sm">
                Já tem conta? Faça login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'tasks') {
    const TaskCard = ({ task }) => (
      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 hover:bg-gray-800/50 transition-all group">
        {editingTask?.id === task.id ? (
          <div className="space-y-3">
            <input type="text" value={editingTask.title} onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            <textarea value={editingTask.description} onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-orange-500" rows="2" />
            <input type="date" value={editingTask.dueDate} onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            <div className="flex gap-2">
              <button onClick={handleUpdateTask} className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm py-2 rounded-lg transition-all">Salvar</button>
              <button onClick={() => setEditingTask(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded-lg transition-all">Cancelar</button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <button onClick={() => handleToggleTask(task.id)} className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-orange-500 border-orange-500' : 'border-gray-600 hover:border-orange-500'}`} style={{ padding: '2px' }}>
              {task.completed && <Check size={12} className="text-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium mb-1 text-sm ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>{task.title}</h3>
              {task.description && <p className={`text-xs mb-2 ${task.completed ? 'text-gray-600' : 'text-gray-400'}`}>{task.description}</p>}
              <div className="flex items-center gap-3 text-xs">
                {task.dueDate && (
                  <span className={`flex items-center gap-1 ${isOverdue(task.dueDate) && !task.completed ? 'text-red-400' : task.completed ? 'text-gray-600' : 'text-gray-500'}`}>
                    <Calendar size={12} />
                    {formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setEditingTask(task)} className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700/50 rounded transition-all">
                <Edit2 size={14} />
              </button>
              <button onClick={() => setDeleteConfirm(task.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    );

    return (
      <div className="w-screen h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 mb-6 border border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Hoje</h1>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <Clock size={14} />
                  {taskStats.total} tarefas
                </p>
              </div>
              <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all">
                <Settings size={20} />
              </button>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>{taskStats.completed} de {taskStats.total} concluídas</span>
                <span>{Math.round(taskStats.percentage)}%</span>
              </div>
              <div className="w-full bg-gray-700/30 rounded-full h-2">
                <div className=" bg-gradient-to-r from-orange-500 to-orange-400 h-full rounded-full transition-all duration-500" style={{ width: `${taskStats.percentage}%` }} />
              </div>
            </div>
            <div className="flex gap-2 mt-6 border-b border-gray-700/50">
              <button onClick={() => setActiveTab('active')} className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === 'active' ? 'text-white border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-300'}`}>Ativas</button>
              <button onClick={() => setActiveTab('completed')} className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === 'completed' ? 'text-white border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-300'}`}>Concluídas ({completedTasks.length})</button>
            </div>
          </div>

          {activeTab === 'active' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(groupTasksByLabel).length === 0 ? (
                <div className="col-span-full bg-gray-800/20 rounded-2xl p-12 text-center border border-gray-700/30">
                  <Check size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Nenhuma tarefa ativa</p>
                  <p className="text-gray-500 text-sm mt-2">Clique no botão + para criar</p>
                </div>
              ) : (
                Object.entries(groupTasksByLabel).map(([label, labelTasks]) => (
                  <div key={label} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                        <Tag size={14} />
                        {label}
                        <span className="text-gray-500 text-xs">{labelTasks.length}</span>
                      </h2>
                    </div>
                    <div className="space-y-3">
                      {labelTasks.map(task => <TaskCard key={task.id} task={task} />)}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {completedTasks.length === 0 ? (
                <div className="bg-gray-800/20 rounded-2xl p-12 text-center border border-gray-700/30">
                  <Check size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Nenhuma tarefa concluída</p>
                </div>
              ) : (
                completedTasks.map(task => <TaskCard key={task.id} task={task} />)
              )}
            </div>
          )}

          <button onClick={() => setShowAddTask(true)} className="fixed bottom-8 right-8 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 z-50">
            <Plus size={28} />
          </button>
        </div>

        {showAddTask && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Nova Tarefa</h2>
                <button onClick={() => { setShowAddTask(false); setNewTask({ title: '', description: '', dueDate: '', label: '' }); setError(''); }} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Título *</label>
                  <input type="text" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="Nome da tarefa" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Categoria</label>
                  <input type="text" value={newTask.label} onChange={(e) => setNewTask({ ...newTask, label: e.target.value })} placeholder="Ex: Casa, Trabalho, Saúde" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Data</label>
                  <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Descrição</label>
                  <textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="Detalhes adicionais" rows="3" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none" />
                </div>
                {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">{error}</div>}
                <button onClick={handleCreateTask} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all">Criar Tarefa</button>
              </div>
            </div>
          </div>
        )}

        {showSettings && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Configurações</h2>
                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-xs mb-1">Usuário</p>
                  <p className="text-white font-medium">{user?.email}</p>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-3 rounded-lg transition-all border border-red-500/30">
                  <LogOut size={18} />
                  Sair da Conta
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-4">Confirmar Exclusão</h2>
              <p className="text-gray-300 mb-6">Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <button onClick={() => handleDeleteTask(deleteConfirm)} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-lg transition-all">Excluir</button>
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all">Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default TodoListApp;
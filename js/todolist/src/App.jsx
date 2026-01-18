import React, { useState, useMemo, useEffect } from 'react';
import { Check, Plus, LogOut, Trash2, Edit2, Calendar, Settings, X, Tag, Clock } from 'lucide-react';

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
  const [newTask, setNewTask] = useState({ titulo: '', descricao: '' });
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

  async function fetchTasks() {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BASE_URL}/tasks`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch tasks");
    }
    
    const data = await res.json();
    return data;
  }

  async function createTaskAPI(task) {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(task)
    });
    
    if (!res.ok) {
      throw new Error("Failed to create task");
    }
    
    return await res.json();
  }

  async function updateTaskAPI(taskId, task) {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(task)
    });
    
    if (!res.ok) {
      throw new Error("Failed to update task");
    }
    
    return await res.json();
  }

  async function deleteTaskAPI(taskId) {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!res.ok) {
      throw new Error("Failed to delete task");
    }
    
    return await res.json();
  }

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar tarefas");
    }
  };

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      setError("Preencha todos os campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const loginAuth = await login(loginData.email, loginData.password);

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
    localStorage.removeItem("access_token");
    setUser(null);
    setTasks([]);
    setCurrentView('login');
    setLoginData({ email: '', password: '' });
    setShowSettings(false);
  };

  const handleCreateTask = async () => {
    if (!newTask.titulo.trim()) {
      setError('O título da tarefa é obrigatório');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createTaskAPI({
        titulo: newTask.titulo,
        descricao: newTask.descricao,
        status: 'pendente'
      });

      await loadTasks();
      setNewTask({ titulo: '', descricao: '' });
      setShowAddTask(false);
    } catch (err) {
      console.error(err);
      setError('Erro ao criar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async () => {
    setLoading(true);
    setError('');

    try {
      await updateTaskAPI(editingTask.id, {
        titulo: editingTask.titulo,
        descricao: editingTask.descricao,
        status: editingTask.status
      });

      await loadTasks();
      setEditingTask(null);
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (task) => {
    setLoading(true);

    try {
      const newStatus = task.status === 'concluida' ? 'pendente' : 'concluida';
      await updateTaskAPI(task.id, {
        titulo: task.titulo,
        descricao: task.descricao,
        status: newStatus
      });

      await loadTasks();
    } catch (err) {
      console.error(err);
      setError('Erro ao atualizar status');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setLoading(true);

    try {
      await deleteTaskAPI(taskId);
      await loadTasks();
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      setError('Erro ao excluir tarefa');
    } finally {
      setLoading(false);
    }
  };

  const activeTasks = useMemo(() => tasks.filter(t => t.status !== 'concluida'), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'concluida'), [tasks]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'concluida').length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, percentage };
  }, [tasks]);

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
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
            <input type="text" value={editingTask.titulo} onChange={(e) => setEditingTask({ ...editingTask, titulo: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" />
            <textarea value={editingTask.descricao} onChange={(e) => setEditingTask({ ...editingTask, descricao: e.target.value })} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-orange-500" rows="2" />
            <div className="flex gap-2">
              <button onClick={handleUpdateTask} disabled={loading} className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm py-2 rounded-lg transition-all disabled:opacity-50">Salvar</button>
              <button onClick={() => setEditingTask(null)} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded-lg transition-all">Cancelar</button>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <button onClick={() => handleToggleTask(task)} disabled={loading} className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${task.status === 'concluida' ? 'bg-orange-500 border-orange-500' : 'border-gray-600 hover:border-orange-500'}`} style={{ padding: '2px' }}>
              {task.status === 'concluida' && <Check size={12} className="text-white" />}
            </button>
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium mb-1 text-sm ${task.status === 'concluida' ? 'line-through text-gray-500' : 'text-white'}`}>{task.titulo}</h3>
              {task.descricao && <p className={`text-xs mb-2 ${task.status === 'concluida' ? 'text-gray-600' : 'text-gray-400'}`}>{task.descricao}</p>}
              <div className="flex items-center gap-3 text-xs">
                <span className={`flex items-center gap-1 ${task.status === 'concluida' ? 'text-gray-600' : 'text-gray-500'}`}>
                  <Clock size={12} />
                  {formatDate(task.data_criacao)}
                </span>
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
                <h1 className="text-2xl font-bold text-white mb-1">Minhas Tarefas</h1>
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
                <div className="bg-gradient-to-r from-orange-500 to-orange-400 h-full rounded-full transition-all duration-500" style={{ width: `${taskStats.percentage}%` }} />
              </div>
            </div>
            <div className="flex gap-2 mt-6 border-b border-gray-700/50">
              <button onClick={() => setActiveTab('active')} className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === 'active' ? 'text-white border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-300'}`}>Ativas ({activeTasks.length})</button>
              <button onClick={() => setActiveTab('completed')} className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === 'completed' ? 'text-white border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-300'}`}>Concluídas ({completedTasks.length})</button>
            </div>
          </div>

          {activeTab === 'active' ? (
            <div className="space-y-3">
              {activeTasks.length === 0 ? (
                <div className="bg-gray-800/20 rounded-2xl p-12 text-center border border-gray-700/30">
                  <Check size={48} className="text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">Nenhuma tarefa ativa</p>
                  <p className="text-gray-500 text-sm mt-2">Clique no botão + para criar</p>
                </div>
              ) : (
                activeTasks.map(task => <TaskCard key={task.id} task={task} />)
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
                <button onClick={() => { setShowAddTask(false); setNewTask({ titulo: '', descricao: '' }); setError(''); }} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Título *</label>
                  <input type="text" value={newTask.titulo} onChange={(e) => setNewTask({ ...newTask, titulo: e.target.value })} placeholder="Nome da tarefa" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">Descrição</label>
                  <textarea value={newTask.descricao} onChange={(e) => setNewTask({ ...newTask, descricao: e.target.value })} placeholder="Detalhes adicionais" rows="3" className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none" />
                </div>
                {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">{error}</div>}
                <button onClick={handleCreateTask} disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50">
                  {loading ? 'Criando...' : 'Criar Tarefa'}
                </button>
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
                <button onClick={() => handleDeleteTask(deleteConfirm)} disabled={loading} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50">
                  {loading ? 'Excluindo...' : 'Excluir'}
                </button>
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
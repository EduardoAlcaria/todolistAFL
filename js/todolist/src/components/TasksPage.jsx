import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Settings, Clock, Check, Calendar, Tag } from 'lucide-react';
import api from '../services/api';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';
import SettingsModal from './SettingsModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const TasksPage = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [newTask, setNewTask] = useState({ 
    titulo: '', 
    descricao: '', 
    categoria_id: null, 
    data_vencimento: null 
  });
  const [editingTask, setEditingTask] = useState(null);
  
  // Ordenação
  const [sortBy, setSortBy] = useState('category'); // 'category' ou 'date'

  useEffect(() => {
    loadTasks();
    loadCategories();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await api.fetchTasks();
      // Validar e garantir que subtasks sempre seja um array
      const validatedData = Array.isArray(data) ? data.map(task => ({
        ...task,
        subtasks: Array.isArray(task.subtasks) ? task.subtasks : []
      })) : [];
      setTasks(validatedData);
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
      setError("Erro ao carregar tarefas");
    }
  };

  const loadCategories = async () => {
    try {
      const data = await api.fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.titulo.trim()) {
      setError('O título da tarefa é obrigatório');
      return;
    }

    setLoading(true);
    setError('');

    try {

      if (newTask.data_vencimento < new Date().toISOString().split('T')[0]) {
        setError('A data de vencimento não pode ser no passado');
        setLoading(false);
        return;
      }
      
      await api.createTask({
        titulo: newTask.titulo,
        descricao: newTask.descricao,
        status: 'pendente',
        categoria_id: newTask.categoria_id,
        data_vencimento: newTask.data_vencimento
      });

      await loadTasks();
      setNewTask({ titulo: '', descricao: '', categoria_id: null, data_vencimento: null });
      setShowAddTask(false);
    } catch (err) {
      console.error(err);
      setError('Erro ao criar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (task) => {
    setLoading(true);
    setError('');

    try {
      await api.updateTask(task.id, {
        titulo: task.titulo,
        descricao: task.descricao,
        status: task.status,
        categoria_id: task.categoria_id,
        data_vencimento: task.data_vencimento
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
      await api.updateTask(task.id, {
        titulo: task.titulo,
        descricao: task.descricao,
        status: newStatus,
        categoria_id: task.categoria_id,
        data_vencimento: task.data_vencimento
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
      await api.deleteTask(taskId);
      await loadTasks();
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      setError('Erro ao excluir tarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (nome, cor) => {
    try {
      await api.createCategory({ nome, cor });
      await loadCategories();
    } catch (err) {
      console.error(err);
      setError('Erro ao criar categoria');
    }
  };

  const handleAddSubtask = async (taskId, titulo) => {
    if (!taskId || !titulo.trim()) return;
    
    setLoading(true);
    try {
      await api.createSubtask(taskId, { titulo, concluida: false });
      await loadTasks();
    } catch (err) {
      console.error('Erro ao criar subtask:', err);
      setError('Erro ao criar subtarefa');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubTask = async (subtask) => {
    setLoading(true);
    setError('');

    try {
      await api.updateSubtask(subtask.id, {
        titulo: subtask.titulo,
        status: subtask.status,
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

  const handleToggleSubtask = async (subtaskId, concluida) => {
    try {
      await api.updateSubtask(subtaskId, { concluida });
      await loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      await api.deleteSubtask(subtaskId);
      await loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    api.logout();
    onLogout();
  };

  // Filtrar tarefas por tab
  const filteredTasks = useMemo(() => {
    if (activeTab === 'active') {
      return tasks.filter(t => t.status !== 'concluida');
    } else {
      return tasks.filter(t => t.status === 'concluida');
    }
  }, [tasks, activeTab]);

  // Agrupar por categoria ou data baseado em sortBy
  const groupedTasks = useMemo(() => {
    const groups = {};

    if (sortBy === 'category') {
      // Agrupar por categoria
      filteredTasks.forEach(task => {
        if (!task) return; // Pular tarefas inválidas
        const key = task.categoria_nome || 'Sem categoria';
        if (!groups[key]) groups[key] = [];
        groups[key].push(task);
      });

      // Ordenar tarefas dentro de cada grupo por data
      Object.keys(groups).forEach(key => {
        groups[key].sort((a, b) => {
          if (!a || !b) return 0;
          if (!a.data_vencimento) return 1;
          if (!b.data_vencimento) return -1;
          return new Date(a.data_vencimento) - new Date(b.data_vencimento);
        });
      });

    } else if (sortBy === 'date') {
      // Agrupar por data
      filteredTasks.forEach(task => {
        if (!task) return; // Pular tarefas inválidas
        const key = task.data_vencimento 
          ? new Date(task.data_vencimento).toLocaleDateString('pt-BR')
          : 'Sem data';
        if (!groups[key]) groups[key] = [];
        groups[key].push(task);
      });

      // Ordenar tarefas dentro de cada grupo por categoria
      Object.keys(groups).forEach(key => {
        groups[key].sort((a, b) => {
          if (!a || !b) return 0;
          const catA = a.categoria_nome || 'Sem categoria';
          const catB = b.categoria_nome || 'Sem categoria';
          return catA.localeCompare(catB);
        });
      });
    }

    return groups;
  }, [filteredTasks, sortBy]);

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

  const uniqueDates = useMemo(() => {
    const dates = new Set();
    tasks.forEach(task => {
      if (task.data_vencimento) {
        dates.add(task.data_vencimento);
      }
    });
    return Array.from(dates).sort();
  }, [tasks]);

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
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
            <button 
              onClick={() => setShowSettings(true)} 
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
            >
              <Settings size={20} />
            </button>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>{taskStats.completed} de {taskStats.total} concluídas</span>
              <span>{Math.round(taskStats.percentage)}%</span>
            </div>
            <div className="w-full bg-gray-700/30 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-orange-400 h-full rounded-full transition-all duration-500" 
                style={{ width: `${taskStats.percentage}%` }} 
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6 border-b border-gray-700/50 pb-3">
            <button 
              onClick={() => setActiveTab('active')} 
              className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === 'active' ? 'text-white border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-300'}`}
            >
              Ativas ({activeTasks.length})
            </button>
            <button 
              onClick={() => setActiveTab('completed')} 
              className={`px-4 py-2 text-sm font-medium transition-all ${activeTab === 'completed' ? 'text-white border-b-2 border-orange-500' : 'text-gray-400 hover:text-gray-300'}`}
            >
              Concluídas ({completedTasks.length})
            </button>
          </div>

          {/* Botões de ordenação */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSortBy('category')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sortBy === 'category' ? 'bg-orange-500 text-white' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}
            >
              <Tag size={14} className="inline mr-1" />
              Ordenar por Categoria
            </button>

            <button
              onClick={() => setSortBy('date')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${sortBy === 'date' ? 'bg-orange-500 text-white' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}
            >
              <Calendar size={14} className="inline mr-1" />
              Ordenar por Data
            </button>
          </div>
        </div>

        {/* Lista de tarefas agrupadas */}
        {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
          <div key={groupName} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-lg font-semibold text-white">{groupName}</h2>
              <span className="text-sm text-gray-500">({groupTasks.length})</span>
            </div>

            {groupTasks.length === 0 ? (
              <div className="bg-gray-800/20 rounded-2xl p-12 text-center border border-gray-700/30">
                <Check size={48} className="text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">
                  {activeTab === 'active' ? 'Nenhuma tarefa ativa' : 'Nenhuma tarefa concluída'}
                </p>
                {activeTab === 'active' && (
                  <p className="text-gray-500 text-sm mt-2">Clique no botão + para criar</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {groupTasks
                .filter(task => task && task.id) // Validar tarefas
                .map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    loading={loading}
                    onToggle={handleToggleTask}
                    onEdit={setEditingTask}
                    onDelete={setDeleteConfirm}
                    editingTask={editingTask}
                    onSaveEdit={handleUpdateTask}
                    onCancelEdit={() => setEditingTask(null)}
                    formatDate={formatDate}
                    categories={categories}
                    onSubtaskAdd={handleAddSubtask}
                    onSubtaskUpdate={handleUpdateSubTask}
                    onSubtaskToggle={handleToggleSubtask}
                    onSubtaskDelete={handleDeleteSubtask}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        <button 
          onClick={() => setShowAddTask(true)} 
          className="fixed bottom-8 right-8 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 z-50"
        >
          <Plus size={28} />
        </button>
      </div>

      <AddTaskModal 
        show={showAddTask}
        onClose={() => { 
          setShowAddTask(false); 
          setNewTask({ titulo: '', descricao: '', categoria_id: null, data_vencimento: null }); 
          setError(''); 
        }}
        newTask={newTask}
        onChange={setNewTask}
        onCreate={handleCreateTask}
        loading={loading}
        error={error}
        categories={categories}
        onCreateCategory={handleCreateCategory}
      />

      <SettingsModal 
        show={showSettings}
        onClose={() => setShowSettings(false)}
        user={user}
        onLogout={handleLogout}
      />

      <DeleteConfirmModal 
        show={deleteConfirm !== null}
        onConfirm={() => handleDeleteTask(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
        loading={loading}
      />
    </div>
  );
};

export default TasksPage;
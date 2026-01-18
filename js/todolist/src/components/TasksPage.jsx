import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Settings, Clock, Check, Filter, X, Calendar, Tag } from 'lucide-react';
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
  
  // Filtros
  const [filterType, setFilterType] = useState('none'); // 'none', 'category', 'date'
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState(null);

  useEffect(() => {
    loadTasks();
    loadCategories();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await api.fetchTasks();
      setTasks(data);
    } catch (err) {
      console.error(err);
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

  // Subtasks
  const handleAddSubtask = async (taskId, titulo) => {
    if (!taskId || !titulo.trim()) return;
    try {
      await api.createSubtask(taskId, { titulo, concluida: false });
      await loadTasks();
    } catch (err) {
      console.error(err);
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

  // Filtros
  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    
    if (activeTab === 'active') {
      filtered = filtered.filter(t => t.status !== 'concluida');
    } else {
      filtered = filtered.filter(t => t.status === 'concluida');
    }

    if (filterType === 'category' && selectedCategoryFilter) {
      filtered = filtered.filter(t => t.categoria_id === selectedCategoryFilter);
    }

    if (filterType === 'date' && selectedDateFilter) {
      filtered = filtered.filter(t => {
        if (!t.data_vencimento) return false;
        return t.data_vencimento === selectedDateFilter;
      });
    }

    return filtered;
  }, [tasks, activeTab, filterType, selectedCategoryFilter, selectedDateFilter]);

  // Agrupar por categoria ou data
  const groupedTasks = useMemo(() => {
    if (filterType === 'none') {
      return { 'Todas': filteredTasks };
    }

    const groups = {};

    if (filterType === 'category') {
      filteredTasks.forEach(task => {
        const key = task.categoria_nome || 'Sem categoria';
        if (!groups[key]) groups[key] = [];
        groups[key].push(task);
      });
    } else if (filterType === 'date') {
      filteredTasks.forEach(task => {
        const key = task.data_vencimento 
          ? new Date(task.data_vencimento).toLocaleDateString('pt-BR')
          : 'Sem data';
        if (!groups[key]) groups[key] = [];
        groups[key].push(task);
      });
    }

    return groups;
  }, [filteredTasks, filterType]);

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

          {/* Filtros */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setFilterType('none');
                setSelectedCategoryFilter(null);
                setSelectedDateFilter(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterType === 'none' ? 'bg-orange-500 text-white' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}
            >
              <Filter size={14} className="inline mr-1" />
              Todas
            </button>

            <div className="relative">
              <button
                onClick={() => setFilterType(filterType === 'category' ? 'none' : 'category')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterType === 'category' ? 'bg-orange-500 text-white' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}
              >
                <Tag size={14} className="inline mr-1" />
                Por Categoria
              </button>
              {filterType === 'category' && (
                <div className="absolute top-full mt-2 left-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 min-w-[200px]">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategoryFilter(cat.id)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-all ${selectedCategoryFilter === cat.id ? 'bg-gray-700 text-orange-400' : 'text-white'}`}
                    >
                      <span 
                        className="inline-block w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: cat.cor }}
                      />
                      {cat.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setFilterType(filterType === 'date' ? 'none' : 'date')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filterType === 'date' ? 'bg-orange-500 text-white' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}
              >
                <Calendar size={14} className="inline mr-1" />
                Por Data
              </button>
              {filterType === 'date' && (
                <div className="absolute top-full mt-2 left-0 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 min-w-[200px] max-h-[300px] overflow-y-auto">
                  {uniqueDates.map(date => (
                    <button
                      key={date}
                      onClick={() => setSelectedDateFilter(date)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-all ${selectedDateFilter === date ? 'bg-gray-700 text-orange-400' : 'text-white'}`}
                    >
                      {new Date(date).toLocaleDateString('pt-BR')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {(selectedCategoryFilter || selectedDateFilter) && (
              <button
                onClick={() => {
                  setSelectedCategoryFilter(null);
                  setSelectedDateFilter(null);
                }}
                className="px-3 py-1.5 rounded-lg text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
              >
                <X size={14} className="inline mr-1" />
                Limpar filtro
              </button>
            )}
          </div>
        </div>

        {/* Lista de tarefas agrupadas */}
        {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
          <div key={groupName} className="mb-6">
            {filterType !== 'none' && (
              <div className="flex items-center gap-2 mb-3">
                <h2 className="text-lg font-semibold text-white">{groupName}</h2>
                <span className="text-sm text-gray-500">({groupTasks.length})</span>
              </div>
            )}

            {groupTasks.length === 0 && filterType === 'none' ? (
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
                .filter(Boolean)
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
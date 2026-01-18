import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Settings, Calendar, Tag, List } from 'lucide-react';
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
  const [selectedCategory, setSelectedCategory] = useState(null); // Nova state para categoria selecionada
  const [newTask, setNewTask] = useState({ 
    titulo: '', 
    descricao: '', 
    categoria_id: null, 
    data_vencimento: null 
  });
  const [editingTask, setEditingTask] = useState(null);
  const [sortBy, setSortBy] = useState('category');

  useEffect(() => {
    loadTasks();
    loadCategories();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await api.fetchTasks();
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
      if (newTask.data_vencimento && newTask.data_vencimento < new Date().toISOString().split('T')[0]) {
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

  const filteredTasks = useMemo(() => {
    let filtered = tasks;
    
    // Filtrar por status (ativa/concluída)
    if (activeTab === 'active') {
      filtered = filtered.filter(t => t.status !== 'concluida');
    } else {
      filtered = filtered.filter(t => t.status === 'concluida');
    }
    
    // Filtrar por categoria selecionada
    if (selectedCategory) {
      filtered = filtered.filter(t => t.categoria_nome === selectedCategory);
    }
    
    return filtered;
  }, [tasks, activeTab, selectedCategory]);

  const groupedTasks = useMemo(() => {
    const groups = {};

    const parseLocalDate = (dateString) => {
      if (!dateString) return null;
      const [year, month, day] = dateString.split('-');
      return new Date(year, month - 1, day);
    };

    if (sortBy === 'category') {
      filteredTasks.forEach(task => {
        if (!task) return;
        const key = task.categoria_nome || 'Sem categoria';
        if (!groups[key]) groups[key] = [];
        groups[key].push(task);
      });

      Object.keys(groups).forEach(key => {
        groups[key].sort((a, b) => {
          if (!a || !b) return 0;
          if (!a.data_vencimento) return 1;
          if (!b.data_vencimento) return -1;
          return parseLocalDate(a.data_vencimento) - parseLocalDate(b.data_vencimento);
        });
      });

    } else if (sortBy === 'date') {
      filteredTasks.forEach(task => {
        if (!task) return;
        const key = task.data_vencimento 
          ? parseLocalDate(task.data_vencimento).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })
          : 'Sem data';
        if (!groups[key]) groups[key] = [];
        groups[key].push(task);
      });

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
    const [year, month, day] = dateString.split('-'); 
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short'});
  };

  // Contador de tarefas por categoria (baseado nas tarefas filtradas)
  const categoryCount = useMemo(() => {
    const counts = {};
    // Usar todas as tarefas do activeTab, não as filtradas por categoria
    const tasksForCount = activeTab === 'active' 
      ? tasks.filter(t => t.status !== 'concluida')
      : tasks.filter(t => t.status === 'concluida');
      
    tasksForCount.forEach(task => {
      const catName = task.categoria_nome || 'Sem categoria';
      counts[catName] = (counts[catName] || 0) + 1;
    });
    return counts;
  }, [tasks, activeTab]);

  return (
    <div className="w-screen h-screen bg-[#1f1f1f] flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 bg-[#282828] border-r border-[#3a3a3a] flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-[#3a3a3a]">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-white">Minhas Tarefas</h1>
            <button 
              onClick={() => setShowSettings(true)} 
              className="p-2 text-gray-400 hover:text-white hover:bg-[#3a3a3a] rounded-lg transition-all"
            >
              <Settings size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('active')} 
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'active' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-400 hover:bg-[#3a3a3a]'
              }`}
            >
              Ativas {activeTasks.length}
            </button>
            <button 
              onClick={() => setActiveTab('completed')} 
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === 'completed' 
                  ? 'bg-orange-500 text-white' 
                  : 'text-gray-400 hover:bg-[#3a3a3a]'
              }`}
            >
              Concluídas {completedTasks.length}
            </button>
          </div>
        </div>

        {/* Ordenação */}
        <div className="p-4 border-b border-[#3a3a3a]">
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Ordenar por</h3>
          <div className="space-y-1">
            <button
              onClick={() => setSortBy('category')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${
                sortBy === 'category'
                  ? 'bg-[#3a3a3a] text-white'
                  : 'text-gray-400 hover:bg-[#3a3a3a]'
              }`}
            >
              <Tag size={16} />
              Categoria
            </button>
            <button
              onClick={() => setSortBy('date')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all ${
                sortBy === 'date'
                  ? 'bg-[#3a3a3a] text-white'
                  : 'text-gray-400 hover:bg-[#3a3a3a]'
              }`}
            >
              <Calendar size={16} />
              Data
            </button>
          </div>
        </div>

        {/* Categorias */}
        {sortBy === 'category' && (
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase">Categorias</h3>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="text-xs text-orange-400 hover:text-orange-300"
                >
                  Limpar
                </button>
              )}
            </div>
            <div className="space-y-1">
              {Object.entries(categoryCount).map(([catName, count]) => {
                const category = categories.find(c => c.nome === catName);
                const isSelected = selectedCategory === catName;
                
                return (
                  <button
                    key={catName}
                    onClick={() => setSelectedCategory(isSelected ? null : catName)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all ${
                      isSelected
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-300 hover:bg-[#3a3a3a]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {category && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: isSelected ? 'white' : category.cor }}
                        />
                      )}
                      <span>{catName}</span>
                    </div>
                    <span className={`text-xs font-medium ${
                      isSelected ? 'text-white' : 'text-gray-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Progress bar no rodapé da sidebar */}
        <div className="p-4 border-t border-[#3a3a3a]">
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>{taskStats.completed} de {taskStats.total}</span>
            <span>{Math.round(taskStats.percentage)}%</span>
          </div>
          <div className="w-full bg-[#3a3a3a] rounded-full h-2">
            <div 
              className="bg-orange-500 h-full rounded-full transition-all duration-500" 
              style={{ width: `${taskStats.percentage}%` }} 
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-8 py-6 border-b border-[#3a3a3a]">
          <h2 className="text-2xl font-bold text-white mb-1">
            {selectedCategory 
              ? `${selectedCategory} - ${activeTab === 'active' ? 'Ativas' : 'Concluídas'}`
              : activeTab === 'active' ? 'Tarefas Ativas' : 'Tarefas Concluídas'
            }
          </h2>
          <p className="text-sm text-gray-500">
            {activeTab === 'active' 
              ? `${filteredTasks.length} ${filteredTasks.length === 1 ? 'tarefa' : 'tarefas'} pendente${filteredTasks.length === 1 ? '' : 's'}`
              : `${filteredTasks.length} ${filteredTasks.length === 1 ? 'tarefa' : 'tarefas'} concluída${filteredTasks.length === 1 ? '' : 's'}`
            }
          </p>
        </header>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
            <div key={groupName} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-lg font-bold text-white">{groupName}</h3>
                <span className="text-sm text-gray-500">{groupTasks.length}</span>
              </div>

              <div className="space-y-2">
                {groupTasks
                  .filter(task => task && task.id)
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
            </div>
          ))}

          {Object.keys(groupedTasks).length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <List size={64} className="text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                Nenhuma tarefa {activeTab === 'active' ? 'ativa' : 'concluída'}
                {selectedCategory && ` em "${selectedCategory}"`}
              </h3>
              {activeTab === 'active' && (
                <p className="text-gray-500 text-sm">
                  Clique no botão + para criar sua primeira tarefa
                </p>
              )}
            </div>
          )}
        </div>

        {/* Floating Add Button */}
        <button 
          onClick={() => setShowAddTask(true)} 
          className="fixed bottom-8 right-8 bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 z-50"
        >
          <Plus size={28} />
        </button>
      </main>

      {/* Modals */}
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
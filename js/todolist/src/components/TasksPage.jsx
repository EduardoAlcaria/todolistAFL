// js/todolist/src/components/TasksPage.jsx

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Settings, Clock, Check } from 'lucide-react';
import api from '../services/api';
import TaskCard from './TaskCard';
import AddTaskModal from './AddTaskModal';
import SettingsModal from './SettingsModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const TasksPage = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [newTask, setNewTask] = useState({ titulo: '', descricao: '' });
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    loadTasks();
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

  const handleUpdateTask = async (task) => {
    setLoading(true);
    setError('');

    try {
      await api.updateTask(task.id, {
        titulo: task.titulo,
        descricao: task.descricao,
        status: task.status
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

  const handleLogout = () => {
    api.logout();
    onLogout();
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
          <div className="flex gap-2 mt-6 border-b border-gray-700/50">
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
              activeTasks.map(task => (
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
                />
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
              completedTasks.map(task => (
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
                />
              ))
            )}
          </div>
        )}

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
          setNewTask({ titulo: '', descricao: '' }); 
          setError(''); 
        }}
        newTask={newTask}
        onChange={setNewTask}
        onCreate={handleCreateTask}
        loading={loading}
        error={error}
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
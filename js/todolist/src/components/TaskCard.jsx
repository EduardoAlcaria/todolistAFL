import React, { useState } from 'react';
import { Check, Clock, Edit2, Trash2, Plus, X, Calendar, Tag } from 'lucide-react';

// Componente separado para Subtask
const SubtaskItem = ({ 
  subtask, 
  loading, 
  editingTask,
  onEdit,
  onCancelEdit,
  onSubtaskUpdate,
  onSubtaskToggle,
  onSubtaskDelete 
}) => {
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState(subtask.titulo);
  const isEditing = editingTask?.id === subtask.id;

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Toggle button */}
      <button
        onClick={() => onSubtaskToggle(subtask.id, !subtask.concluida)}
        disabled={loading}
        className={`
          flex items-center justify-center
          w-4 h-4        
          rounded-full   
          border-2 border-gray-600
          transition-all
          ${subtask.concluida ? 'bg-orange-500 border-orange-500' : 'hover:border-orange-500'}
          p-0           
        `}
      >
        {subtask.status === 'concluida' && <Check size={10} className="text-white" />}
      </button>

      {isEditing ? (
        <div className="flex-1 flex gap-1">
          <input
            type="text"
            value={editingSubtaskTitle}
            onChange={(e) => setEditingSubtaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSubtaskUpdate({ ...subtask, titulo: editingSubtaskTitle });
                onCancelEdit();
              }
              if (e.key === 'Escape') {
                onCancelEdit();
              }
            }}
            className="flex-1 bg-gray-900/50 border border-gray-700 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-orange-500"
            autoFocus
          />
          <button
            onClick={() => {
              onSubtaskUpdate({ ...subtask, titulo: editingSubtaskTitle });
              onCancelEdit();
            }}
            className="text-green-400 hover:text-green-300"
          >
            <Check size={16} />
          </button>
          <button
            onClick={onCancelEdit}
            className="text-gray-400 hover:text-gray-300"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <>
          <span className={`flex-1 ${subtask.concluida ? 'line-through text-gray-600' : 'text-gray-400'}`}>
            {subtask.titulo}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button
              onClick={() => onEdit(subtask)}
              className="text-gray-400 hover:text-blue-400 hover:bg-gray-700/50 rounded transition-all p-1"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={() => onSubtaskDelete(subtask.id)}
              className="text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded transition-all p-1"
            >
              <X size={12} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const TaskCard = ({ 
  task, 
  loading, 
  onToggle, 
  onEdit, 
  onDelete, 
  editingTask, 
  onSaveEdit, 
  onCancelEdit, 
  formatDate,
  categories,
  onSubtaskAdd,
  onSubtaskUpdate,
  onSubtaskToggle,
  onSubtaskDelete
}) => {

  if (!task || !task.id) return null;
  
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  

  const handleAddSubtask = async () => {
    if (!task?.id || !newSubtaskTitle.trim()) return;
    await onSubtaskAdd(task.id, newSubtaskTitle);
    setNewSubtaskTitle('');
    setShowSubtaskInput(false);
  };

  if (editingTask?.id === task.id) {
    return (
      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 hover:bg-gray-800/50 transition-all">
        <div className="space-y-3">
          <input 
            type="text" 
            value={editingTask.titulo} 
            onChange={(e) => onEdit({ ...editingTask, titulo: e.target.value })} 
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" 
            placeholder="Título da tarefa"
          />
          <textarea 
            value={editingTask.descricao} 
            onChange={(e) => onEdit({ ...editingTask, descricao: e.target.value })} 
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-orange-500" 
            rows="2" 
            placeholder="Descrição"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={editingTask.categoria_id || ''}
              onChange={(e) => onEdit({ ...editingTask, categoria_id: e.target.value ? parseInt(e.target.value) : null })}
              className="bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
            >
              <option value="">Sem categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </select>
            <input
              type="date"
              value={editingTask.data_vencimento || ''}
              onChange={(e) => onEdit({ ...editingTask, data_vencimento: e.target.value || null })}
              className="bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => onSaveEdit(editingTask)} 
              disabled={loading} 
              className="flex-1 bg-green-600 hover:bg-green-500 text-white text-sm py-2 rounded-lg transition-all disabled:opacity-50"
            >
              Salvar
            </button>
            <button 
              onClick={onCancelEdit} 
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 rounded-lg transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(s => s.concluida).length;

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 hover:bg-gray-800/50 transition-all group">
      <div className="flex items-start gap-3">
      <button
        onClick={() => onToggle(task)}
        disabled={loading}
        className={`
          flex items-center justify-center
          w-7 h-7        
          rounded-full   
          border-2 border-gray-600
          transition-all
          ${task.status === 'concluida' ? 'bg-orange-500 border-orange-500' : 'hover:border-orange-500'}
          p-0            
        `}
      >
        {task.status === 'concluida' && <Check size={12} className="text-white" />}
      </button>
                
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className={`font-medium text-sm ${task.status === 'concluida' ? 'line-through text-gray-500' : 'text-white'}`}>
              {task.titulo}
            </h3>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button 
                onClick={() => onEdit(task)} 
                className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700/50 rounded transition-all"
              >
                <Edit2 size={14} />
              </button>
              <button 
                onClick={() => onDelete(task.id)} 
                className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {task.descricao && (
            <p className={`text-xs mb-2 ${task.status === 'concluida' ? 'text-gray-600' : 'text-gray-400'}`}>
              {task.descricao}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
            {task.categoria_nome && (
              <span 
                className="flex items-center gap-1 px-2 py-1 rounded-full" 
                style={{ backgroundColor: `${task.categoria_cor}20`, color: task.categoria_cor }}
              >
                <Tag size={10} />
                {task.categoria_nome}
              </span>
            )}
            {task.data_vencimento && (
              <span className={`flex items-center gap-1 ${task.status === 'concluida' ? 'text-gray-600' : 'text-gray-500'}`}>
                <Calendar size={12} />
                {new Date(task.data_vencimento).toLocaleDateString('pt-BR')}
              </span>
            )}
          </div>
          
          {subtasks.length > 0 && (
            <div className="space-y-1 mb-2">
              {subtasks.map(subtask => (
                <SubtaskItem
                  key={subtask.id}
                  subtask={subtask}
                  loading={loading}
                  editingTask={editingTask}
                  onEdit={onEdit}
                  onCancelEdit={onCancelEdit}
                  onSubtaskUpdate={onSubtaskUpdate}
                  onSubtaskToggle={onSubtaskToggle}
                  onSubtaskDelete={onSubtaskDelete}
                />
              ))}

              {subtasks.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {completedSubtasks}/{subtasks.length} concluídas
                </div>
              )}
            </div>
          )}

          {showSubtaskInput ? (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSubtask();
                  if (e.key === 'Escape') {
                    setShowSubtaskInput(false);
                    setNewSubtaskTitle('');
                  }
                }}
                placeholder="Nova subtarefa"
                className="flex-1 bg-gray-900/50 border border-gray-700 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-orange-500"
                autoFocus
              />
              <button onClick={handleAddSubtask} className="text-green-400 hover:text-green-300">
                <Check size={16} />
              </button>
              <button onClick={() => { setShowSubtaskInput(false); setNewSubtaskTitle(''); }} className="text-gray-400 hover:text-gray-300">
                <X size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSubtaskInput(true)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-400 transition-all mt-1 opacity-0 group-hover:opacity-100"
            >
              <Plus size={12} />
              Adicionar subtarefa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
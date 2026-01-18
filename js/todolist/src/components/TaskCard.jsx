// js/todolist/src/components/TaskCard.jsx

import React from 'react';
import { Check, Clock, Edit2, Trash2 } from 'lucide-react';

const TaskCard = ({ task, loading, onToggle, onEdit, onDelete, editingTask, onSaveEdit, onCancelEdit, formatDate }) => {
  if (editingTask?.id === task.id) {
    return (
      <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 hover:bg-gray-800/50 transition-all group">
        <div className="space-y-3">
          <input 
            type="text" 
            value={editingTask.titulo} 
            onChange={(e) => onEdit({ ...editingTask, titulo: e.target.value })} 
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" 
          />
          <textarea 
            value={editingTask.descricao} 
            onChange={(e) => onEdit({ ...editingTask, descricao: e.target.value })} 
            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-orange-500" 
            rows="2" 
          />
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

  return (
    <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700/50 hover:bg-gray-800/50 transition-all group">
      <div className="flex items-start gap-3">
        <button 
          onClick={() => onToggle(task)} 
          disabled={loading} 
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${task.status === 'concluida' ? 'bg-orange-500 border-orange-500' : 'border-gray-600 hover:border-orange-500'}`} 
          style={{ padding: '2px' }}
        >
          {task.status === 'concluida' && <Check size={12} className="text-white" />}
        </button>
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium mb-1 text-sm ${task.status === 'concluida' ? 'line-through text-gray-500' : 'text-white'}`}>
            {task.titulo}
          </h3>
          {task.descricao && (
            <p className={`text-xs mb-2 ${task.status === 'concluida' ? 'text-gray-600' : 'text-gray-400'}`}>
              {task.descricao}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs">
            <span className={`flex items-center gap-1 ${task.status === 'concluida' ? 'text-gray-600' : 'text-gray-500'}`}>
              <Clock size={12} />
              {formatDate(task.data_criacao)}
            </span>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
    </div>
  );
};

export default TaskCard;
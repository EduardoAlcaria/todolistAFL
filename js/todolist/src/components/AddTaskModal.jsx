// js/todolist/src/components/AddTaskModal.jsx

import React from 'react';
import { X } from 'lucide-react';

const AddTaskModal = ({ show, onClose, newTask, onChange, onCreate, loading, error }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Nova Tarefa</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Título *</label>
            <input 
              type="text" 
              value={newTask.titulo} 
              onChange={(e) => onChange({ ...newTask, titulo: e.target.value })} 
              placeholder="Nome da tarefa" 
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500" 
            />
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Descrição</label>
            <textarea 
              value={newTask.descricao} 
              onChange={(e) => onChange({ ...newTask, descricao: e.target.value })} 
              placeholder="Detalhes adicionais" 
              rows="3" 
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none" 
            />
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">{error}</div>}
          <button 
            onClick={onCreate} 
            disabled={loading} 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Criar Tarefa'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
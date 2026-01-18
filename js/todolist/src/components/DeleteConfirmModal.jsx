// js/todolist/src/components/DeleteConfirmModal.jsx

import React from 'react';

const DeleteConfirmModal = ({ show, onConfirm, onCancel, loading }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Confirmar Exclusão</h2>
        <p className="text-gray-300 mb-6">Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.</p>
        <div className="flex gap-3">
          <button 
            onClick={onConfirm} 
            disabled={loading} 
            className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
          >
            {loading ? 'Excluindo...' : 'Excluir'}
          </button>
          <button 
            onClick={onCancel} 
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-lg transition-all"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
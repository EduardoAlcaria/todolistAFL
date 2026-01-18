import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

const AddTaskModal = ({ 
  show, 
  onClose, 
  newTask, 
  onChange, 
  onCreate, 
  loading, 
  error, 
  categories,
  onCreateCategory 
}) => {
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#F97316');

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    await onCreateCategory(newCategoryName, newCategoryColor);
    setNewCategoryName('');
    setNewCategoryColor('#F97316');
    setShowNewCategory(false);
  };

  if (!show) return null;

  const colors = [
    '#F97316', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', 
    '#EC4899', '#F59E0B', '#14B8A6', '#6366F1', '#F43F5E'
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-700 max-h-[90vh] overflow-y-auto">
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

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Categoria</label>
            {!showNewCategory ? (
              <div className="flex gap-2">
                <select
                  value={newTask.categoria_id || ''}
                  onChange={(e) => onChange({ ...newTask, categoria_id: e.target.value ? parseInt(e.target.value) : null })}
                  className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="">Sem categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowNewCategory(true)}
                  className="p-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                  title="Nova categoria"
                >
                  <Plus size={20} />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nome da categoria"
                    className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  />
                  <button
                    onClick={() => {
                      setShowNewCategory(false);
                      setNewCategoryName('');
                    }}
                    className="p-2.5 text-gray-400 hover:text-white"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewCategoryColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${newCategoryColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleCreateCategory}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 rounded-lg transition-all"
                >
                  Criar Categoria
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">Data de Vencimento</label>
            <input 
              type="date" 
              value={newTask.data_vencimento || ''} 
              onChange={(e) => onChange({ ...newTask, data_vencimento: e.target.value || null })} 
              className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-orange-500" 
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

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
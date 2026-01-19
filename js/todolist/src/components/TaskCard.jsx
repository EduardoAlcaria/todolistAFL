// TaskCard.jsx
// Este componente é responsável por renderizar cada tarefa individual, incluindo suas subtarefas e ações associadas.
// Ele também gerencia a edição de tarefas e subtarefas, bem como a adição de novas subtarefas.

// Importações necessárias
import React, { useState } from 'react';
import { Check, Clock, Edit2, Trash2, Plus, X, Calendar, Tag, MoreHorizontal } from 'lucide-react';

// Componente SubtaskItem
// Este componente renderiza uma subtarefa individual e permite ações como edição, exclusão e alternância de status.
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
    <div className="flex items-center gap-2 py-1 group/subtask">
      <button
        onClick={() => onSubtaskToggle(subtask.id, !subtask.concluida)}
        disabled={loading}
        className={`
          w-4 h-4
          flex items-center justify-center
          rounded-full
          border-2
          transition-all
          flex-shrink-0
          ${subtask.concluida
            ? 'bg-orange-500 border-orange-500' 
            : 'border-gray-600 hover:border-orange-500'
          }
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
            className="flex-1 bg-[#1f1f1f] border border-gray-700 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-orange-500"
            autoFocus
          />
          <button
            onClick={() => {
              onSubtaskUpdate({ ...subtask, titulo: editingSubtaskTitle });
              onCancelEdit();
            }}
            className="text-green-400 hover:text-green-300 p-1"
          >
            <Check size={14} />
          </button>
          <button
            onClick={onCancelEdit}
            className="text-gray-400 hover:text-gray-300 p-1"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <span className={`flex-1 text-sm ${
            subtask.concluida ? 'line-through text-gray-600' : 'text-gray-300'
          }`}>
            {subtask.titulo}
          </span>
          <div className="flex gap-1 opacity-0 group-hover/subtask:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(subtask)}
              className="text-gray-500 hover:text-blue-400 p-1 rounded hover:bg-[#3a3a3a] transition-all"
            >
              <Edit2 size={12} />
            </button>
            <button
              onClick={() => onSubtaskDelete(subtask.id)}
              className="text-gray-500 hover:text-red-400 p-1 rounded hover:bg-[#3a3a3a] transition-all"
            >
              <X size={12} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Componente principal TaskCard
// Este componente renderiza uma tarefa individual, incluindo subtarefas e ações como edição, exclusão e alternância de status.
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
  const [showMenu, setShowMenu] = useState(false);

  const handleAddSubtask = async () => {
    if (!task?.id || !newSubtaskTitle.trim()) return;
    await onSubtaskAdd(task.id, newSubtaskTitle);
    setNewSubtaskTitle('');
    setShowSubtaskInput(false);
  };

  if (editingTask?.id === task.id) {
    return (
      <div className="bg-[#282828] rounded-lg p-4 border border-[#3a3a3a]">
        <div className="space-y-3">
          <input 
            type="text" 
            value={editingTask.titulo} 
            onChange={(e) => onEdit({ ...editingTask, titulo: e.target.value })} 
            className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500" 
            placeholder="Título da tarefa"
          />
          <textarea 
            value={editingTask.descricao} 
            onChange={(e) => onEdit({ ...editingTask, descricao: e.target.value })} 
            className="w-full bg-[#1f1f1f] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-orange-500" 
            rows="2" 
            placeholder="Descrição"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={editingTask.categoria_id || ''}
              onChange={(e) => onEdit({ ...editingTask, categoria_id: e.target.value ? parseInt(e.target.value) : null })}
              className="bg-[#1f1f1f] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
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
              className="bg-[#1f1f1f] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
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
    <div className="bg-[#282828] rounded-lg border border-[#3a3a3a] hover:bg-[#2d2d2d] transition-all group">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => onToggle(task)}
            disabled={loading}
            className={`
              w-5 h-5
              flex items-center justify-center
              rounded-full
              border-2
              transition-all
              flex-shrink-0
              ${task.status === 'concluida' 
                ? 'bg-orange-500 border-orange-500' 
                : 'border-gray-600 hover:border-orange-500'
              }
            `}
          >
            {task.status === 'concluida' && <Check size={14} className="text-white" />}
          </button>
          
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-medium mb-1 ${
              task.status === 'concluida' ? 'line-through text-gray-500' : 'text-white'
            }`}>
              {task.titulo}
            </h3>

            {task.descricao && (
              <p className={`text-xs mb-2 ${
                task.status === 'concluida' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {task.descricao}
              </p>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
              {/* Subtasks indicator */}
              {subtasks.length > 0 && (
                <span className="flex items-center gap-1 text-gray-500">
                  <div className="w-3 h-3 rounded border border-gray-600 flex items-center justify-center">
                    <div className={`w-1.5 h-1.5 rounded-sm ${
                      completedSubtasks === subtasks.length ? 'bg-orange-500' : 'bg-gray-600'
                    }`} />
                  </div>
                  {completedSubtasks}/{subtasks.length}
                </span>
              )}

              {task.data_vencimento && (
                <span className={`flex items-center gap-1 ${
                  task.status === 'concluida' ? 'text-gray-600' : 'text-gray-500'
                }`}>
                  <Calendar size={12} />
                  {formatDate(task.data_vencimento)}
                </span>
              )}

              {task.categoria_nome && (
                <span 
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs" 
                  style={{ 
                    backgroundColor: `${task.categoria_cor}20`, 
                    color: task.categoria_cor 
                  }}
                >
                  <Tag size={10} />
                  {task.categoria_nome}
                </span>
              )}
            </div>

            {/* Subtasks */}
            {subtasks.length > 0 && (
              <div className="mt-2 space-y-1 pl-1">
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
              </div>
            )}

            {/* Add subtask */}
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
                  className="flex-1 bg-[#1f1f1f] border border-gray-700 rounded px-2 py-1.5 text-white text-xs focus:outline-none focus:border-orange-500"
                  autoFocus
                />
                <button 
                  onClick={handleAddSubtask} 
                  className="text-green-400 hover:text-green-300 p-1"
                >
                  <Check size={16} />
                </button>
                <button 
                  onClick={() => { 
                    setShowSubtaskInput(false); 
                    setNewSubtaskTitle(''); 
                  }} 
                  className="text-gray-400 hover:text-gray-300 p-1"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSubtaskInput(true)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-orange-400 transition-all mt-2 opacity-0 group-hover:opacity-100"
              >
                <Plus size={12} />
                Adicionar subtarefa
              </button>
            )}
          </div>

          {/* Actions menu */}
          <div className="relative flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-gray-500 hover:text-white hover:bg-[#3a3a3a] rounded transition-all"
            >
              <MoreHorizontal size={16} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 bg-[#2d2d2d] border border-[#3a3a3a] rounded-lg shadow-xl z-10 min-w-[160px]">
                <button 
                  onClick={() => { 
                    onEdit(task); 
                    setShowMenu(false); 
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-[#3a3a3a] transition-all first:rounded-t-lg"
                >
                  <Edit2 size={14} />
                  Editar
                </button>
                <button 
                  onClick={() => { 
                    onDelete(task.id); 
                    setShowMenu(false); 
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-[#3a3a3a] transition-all last:rounded-b-lg"
                >
                  <Trash2 size={14} />
                  Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
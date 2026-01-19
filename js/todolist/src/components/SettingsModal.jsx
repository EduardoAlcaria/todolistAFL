// SettingsModal.jsx
// Este componente é responsável por renderizar o modal de configurações do usuário.
// Ele permite que o usuário saia da conta ou feche o modal.

// Importações necessárias
import React from 'react';
import { X, LogOut } from 'lucide-react';

// Componente principal SettingsModal
// Props:
// - show: booleano que controla a visibilidade do modal.
// - onClose: função chamada ao fechar o modal.
// - user: informações do usuário (não utilizado diretamente neste componente).
// - onLogout: função chamada ao clicar no botão de logout.
const SettingsModal = ({ show, onClose, user, onLogout }) => {
  if (!show) return null; // Retorna null se o modal não estiver visível.

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Configurações</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <button 
            onClick={onLogout} 
            className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 px-4 py-3 rounded-lg transition-all border border-red-500/30"
          >
            <LogOut size={18} />
            Sair da Conta
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
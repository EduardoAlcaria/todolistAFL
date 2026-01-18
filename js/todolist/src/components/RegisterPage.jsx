// js/todolist/src/components/RegisterPage.jsx

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import api from '../services/api';

const RegisterPage = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!registerData.name || !registerData.email || !registerData.password) {
      setError("Preencha todos os campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.register(
        registerData.name,
        registerData.email,
        registerData.password
      );

      onRegisterSuccess(registerData.email);
    } catch (err) {
      console.error(err);
      setError("Usuário já existe ou erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700/50">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4">
              <Check size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Criar Conta</h1>
            <p className="text-gray-400">Comece a organizar suas tarefas</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Nome</label>
              <input 
                type="text" 
                value={registerData.name} 
                onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} 
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
                placeholder="Seu nome" 
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
              <input 
                type="email" 
                value={registerData.email} 
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} 
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
                placeholder="seu@email.com" 
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Senha</label>
              <input 
                type="password" 
                value={registerData.password} 
                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })} 
                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
                placeholder="••••••••" 
              />
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">{error}</div>}
            <button 
              onClick={handleRegister} 
              disabled={loading} 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
          <div className="mt-6 text-center">
            <button 
              onClick={onSwitchToLogin} 
              className="text-orange-400 hover:text-orange-300 transition-colors text-sm"
            >
              Já tem conta? Faça login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
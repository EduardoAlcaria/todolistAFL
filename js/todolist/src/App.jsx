import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import TasksPage from './components/TasksPage';

const TodoListApp = () => {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentView('tasks');
  };

  const handleRegisterSuccess = () => {
    setCurrentView('login');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
  };

  const handleSwitchToRegister = () => {
    setCurrentView('register');
  };

  const handleSwitchToLogin = () => {
    setCurrentView('login');
  };

  if (currentView === 'login') {
    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess} 
        onSwitchToRegister={handleSwitchToRegister} 
      />
    );
  }

  if (currentView === 'register') {
    return (
      <RegisterPage 
        onRegisterSuccess={handleRegisterSuccess} 
        onSwitchToLogin={handleSwitchToLogin} 
      />
    );
  }

  if (currentView === 'tasks') {
    return (
      <TasksPage 
        user={user} 
        onLogout={handleLogout} 
      />
    );
  }

  return null;
};

export default TodoListApp;
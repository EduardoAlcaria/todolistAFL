# TodoList App

Uma aplicação full-stack de gerenciamento de tarefas (to-do list) com backend em Python FastAPI e frontend em React, hospedada em um serviço na GCP.

## Funcionalidades

* **Autenticação de Usuários:** Registro e login seguro com JWT.
* **Gerenciamento de Tarefas:** Criar, listar, atualizar e excluir tarefas.
* **Subtarefas:** Adicionar, atualizar e excluir subtarefas de uma tarefa.
* **Categorias:** Organizar tarefas em categorias personalizadas com cores únicas.
* **Filtros e Ordenação:**

  * Filtrar tarefas por status (ativo/concluído).
  * Filtrar tarefas por categoria.
  * Ordenar tarefas por categoria ou data de vencimento.
* **Datas de Vencimento:** Atribuir datas de vencimento para tarefas.
* **UI Responsiva:** Interface limpa e moderna com React e Tailwind CSS.
* **Bypass de Desenvolvimento:** Token de acesso de desenvolvimento para pular login durante testes.

## Tecnologias

* **Backend:**

  * Python 3.11, FastAPI
  * SQLite
  * JWT (python-jose)
  * Bcrypt para hash de senhas
* **Frontend:**

  * React + Vite
  * Tailwind CSS
  * Lucide React (ícones)

## Estrutura do Projeto

```
python/                     # Backend
├── api/                     # Rotas da API
│   ├── deps.py              # Dependências (autenticação)
│   └── routes/
│       ├── auth.py          # Rotas de autenticação
│       └── tasks.py         # Rotas de tarefas
├── core/
│   ├── config.py            # Configurações
│   └── security.py          # Funções de segurança
├── db/
│   ├── database.py          # Conexão DB
│   └── init_db.py           # Inicialização DB
├── models/
│   ├── user.py              # Modelos de usuário
│   └── tasks.py             # Modelos de tarefa
├── repositories/
│   ├── user_repo.py         # Repositório de usuários
│   └── task_repo.py         # Repositório de tarefas
├── services/
│   └── auth_service.py      # Serviço de autenticação
└── main.py                  # Aplicação principal

js/todolist/                 # Frontend
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── AddTaskModal.jsx
│   │   ├── DeleteConfirmModal.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── SettingsModal.jsx
│   │   └── TasksPage.jsx
│   ├── services/
│   │   └── api.js           # Serviço de comunicação com API
│   ├── main.jsx             # Entry point
│   └── index.css            # Estilos globais
├── public/
├── index.html
└── vite.config.js
```

## Acessando a Aplicação

* **App:** [https://todolist-frontend-1099393198012.us-central1.run.app](https://todolist-frontend-1099393198012.us-central1.run.app)

## Documentação do Código

Toda a lógica do backend está documentada usando docstrings e comentários detalhados. Inclui:

* **Rotas:** Autenticação, tarefas, subtarefas e categorias.
* **Modelos Pydantic:** Validação de dados de usuários, tarefas, subtarefas e categorias.
* **Repositórios:** CRUD completo no SQLite para usuários, tarefas, subtarefas e categorias.
* **Serviços:** Registro e autenticação de usuários, criação de tokens JWT, hash de senhas.
* **Segurança:** JWT, verificação de senha, bypass de desenvolvimento seguro.
* **Banco de Dados:** Inicialização automática das tabelas (users, categories, tasks, subtasks).


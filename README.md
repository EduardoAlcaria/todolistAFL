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
python/           # Backend FastAPI
  api/            # Rotas da API (autenticação, tarefas, categorias)
  core/           # Segurança e configuração (JWT, hash)
  db/             # Conexão e inicialização do banco
  models/         # Modelos Pydantic
  repositories/   # Acesso a dados
  services/       # Lógica de autenticação

js/todolist/      # Frontend React
  src/components/ # Componentes reutilizáveis
  src/services/   # Serviços de comunicação com API
```

## Acessando a Aplicação

* **Frontend:** https://todolist-frontend-1099393198012.us-central1.run.app/

> Para detalhes completos sobre a API, você pode acessar a documentação interativa depois do deploy.

## Documentação do Código

Toda a lógica do backend está documentada usando docstrings e comentários detalhados. Inclui:

* **Rotas:** Autenticação, tarefas, subtarefas e categorias.
* **Modelos Pydantic:** Validação de dados de usuários, tarefas, subtarefas e categorias.
* **Repositórios:** CRUD completo no SQLite para usuários, tarefas, subtarefas e categorias.
* **Serviços:** Registro e autenticação de usuários, criação de tokens JWT, hash de senhas.
* **Segurança:** JWT, verificação de senha, bypass de desenvolvimento seguro.
* **Banco de Dados:** Inicialização automática das tabelas (users, categories, tasks, subtasks).


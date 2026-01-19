#  TodoList App - Documentação Completa

## Visão Geral

TodoList é uma aplicação full-stack de gerenciamento de tarefas com autenticação JWT, categorias personalizadas, subtarefas e interface moderna. O projeto utiliza Python (FastAPI) no backend e React no frontend, com deploy na Google Cloud Platform (GCP).

**Links de Acesso:**
- **App**: [https://todolist-frontend-1099393198012.us-central1.run.app](https://todolist-frontend-1099393198012.us-central1.run.app/)


---

##  Arquitetura do Sistema

### Stack Tecnológico

**Backend:**
- Python 3.11
- FastAPI (framework web)
- SQLite (banco de dados)
- JWT (autenticação)
- Bcrypt (hash de senhas)
- Uvicorn (servidor ASGI)

**Frontend:**
- React 19
- Vite (build tool)
- Tailwind CSS (estilização)
- Lucide React (ícones)

**Infraestrutura:**
- Docker & Docker Compose
- Google Cloud Run (deploy)
- GitHub (versionamento)

---

##  Estrutura do Projeto

```
todolist/
├── python/                 # Backend FastAPI
│   ├── api/               # Camada de API
│   │   ├── deps.py        # Dependências e autenticação
│   │   └── routes/        # Endpoints REST
│   │       ├── auth.py    # Autenticação (login/registro)
│   │       ├── tasks.py   # CRUD de tarefas
│   │       └── categories.py  # CRUD de categorias
│   ├── core/              # Núcleo da aplicação
│   │   ├── config.py      # Configurações (JWT, SECRET_KEY)
│   │   └── security.py    # Hash de senhas, tokens
│   ├── db/                # Banco de dados
│   │   ├── database.py    # Gerenciador de conexões
│   │   └── init_db.py     # Criação de tabelas
│   ├── models/            # Schemas Pydantic
│   │   ├── user.py        # Validação de usuários
│   │   └── tasks.py       # Validação de tarefas
│   ├── repositories/      # Camada de dados
│   │   ├── user_repo.py   # CRUD usuários
│   │   ├── tasks_repo.py  # CRUD tarefas
│   │   ├── categories_repo.py  # CRUD categorias
│   │   └── subtasks_repo.py    # CRUD subtarefas
│   ├── services/          # Lógica de negócio
│   │   └── auth_service.py
│   ├── main.py            # Arquivo principal
│   └── requirements.txt
│
├── js/todolist/           # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── TasksPage.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── AddTaskModal.jsx
│   │   │   ├── SettingsModal.jsx
│   │   │   └── DeleteConfirmModal.jsx
│   │   ├── services/
│   │   │   └── api.js     # Cliente HTTP
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── Dockerfile.backend
├── Dockerfile.frontend
└── docker-compose.yml
```

---

##  Modelo de Dados

### Tabelas do Banco de Dados

#### **users**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
)
```

#### **categories**
```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    cor TEXT DEFAULT '#F97316',
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
)
```

#### **tasks**
```sql
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    categoria_id INTEGER,
    titulo TEXT NOT NULL,
    descricao TEXT,
    status TEXT DEFAULT 'pendente',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_vencimento DATE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categories (id) ON DELETE SET NULL
)
```

#### **subtasks**
```sql
CREATE TABLE subtasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    concluida BOOLEAN DEFAULT 0,
    ordem INTEGER DEFAULT 0,
    FOREIGN KEY (task_id) REFERENCES tasks (id) ON DELETE CASCADE
)
```

---

##  API Endpoints

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/register` | Registrar novo usuário | ❌ |
| POST | `/login` | Fazer login (retorna JWT) | ❌ |
| GET | `/me` | Obter dados do usuário atual | ✅ |

**Exemplo - Registro:**
```json
POST /register
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Exemplo - Login:**
```json
POST /login
Content-Type: application/x-www-form-urlencoded

username=usuario@exemplo.com&password=senha123

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Tarefas

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/tasks` | Listar tarefas (com filtros opcionais) | ✅ |
| POST | `/tasks` | Criar nova tarefa | ✅ |
| PUT | `/tasks/{task_id}` | Atualizar tarefa | ✅ |
| DELETE | `/tasks/{task_id}` | Excluir tarefa | ✅ |

**Parâmetros de Query (GET /tasks):**
- `categoria_id` (opcional): Filtrar por categoria
- `data_inicio` (opcional): Data inicial (YYYY-MM-DD)
- `data_fim` (opcional): Data final (YYYY-MM-DD)

**Exemplo - Criar Tarefa:**
```json
POST /tasks
Authorization: Bearer {token}

{
  "titulo": "Comprar pão",
  "descricao": "Ir à padaria da esquina",
  "status": "pendente",
  "categoria_id": 1,
  "data_vencimento": "2026-01-25"
}
```

### Subtarefas

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/tasks/{task_id}/subtasks` | Criar subtarefa | ✅ |
| PUT | `/subtasks/{subtask_id}` | Atualizar subtarefa | ✅ |
| DELETE | `/subtasks/{subtask_id}` | Excluir subtarefa | ✅ |

### Categorias

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/categories` | Listar categorias do usuário | ✅ |
| POST | `/categories` | Criar nova categoria | ✅ |
| PUT | `/categories/{category_id}` | Atualizar categoria | ✅ |
| DELETE | `/categories/{category_id}` | Excluir categoria | ✅ |

**Exemplo - Criar Categoria:**
```json
POST /categories
Authorization: Bearer {token}

{
  "nome": "Trabalho",
  "cor": "#3B82F6"
}
```

---

##  Autenticação e Segurança

### Fluxo de Autenticação

1. **Registro**: Senha é hashada com bcrypt antes de salvar no banco
2. **Login**: Credenciais validadas, JWT gerado com expiração de 30 minutos
3. **Requests**: JWT enviado no header `Authorization: Bearer {token}`
4. **Validação**: Middleware extrai e valida token em cada requisição protegida

### Bypass de Desenvolvimento

 **IMPORTANTE**: O código possui um bypass de autenticação para desenvolvimento:

```python
# python/api/deps.py
if token.startswith('dev-bypass-token-'):
    # Permite acesso sem validação real
    # REMOVER EM PRODUÇÃO!
```

**Frontend - Botão Bypass:**
```jsx
// LoginPage.jsx
const handleBypassLogin = () => {
  const fakeToken = 'dev-bypass-token-' + Date.now();
  localStorage.setItem('access_token', fakeToken);
  onLoginSuccess({ email: 'dev@test.com', name: 'Developer' });
};
```

---

##  Funcionalidades do Frontend

### Páginas

1. **LoginPage**: Tela de autenticação
   - Login com email/senha
   - Botão "Bypass" para desenvolvimento
   - Link para cadastro

2. **RegisterPage**: Cadastro de novos usuários
   - Validação de campos
   - Link para login

3. **TasksPage**: Dashboard principal
   - Sidebar com categorias e filtros
   - Lista de tarefas com agrupamento
   - Tabs (Ativas/Concluídas)
   - Barra de progresso

### Componentes Principais

**TaskCard**
- Checkbox para marcar como concluída
- Edição inline de título/descrição
- Subtarefas com toggle individual
- Menu de ações (editar/excluir)
- Exibição de categoria com cor
- Data de vencimento

**AddTaskModal**
- Criação de tarefas
- Seleção de categoria
- Criação de nova categoria inline
- Seletor de cor (10 opções)
- Campo de data de vencimento

**Filtros e Ordenação**
- Ordenar por: Categoria | Data
- Filtrar por categoria específica
- Separação: Ativas | Concluídas

### Gerenciamento de Estado

O estado é gerenciado localmente com `useState`:

```jsx
const [tasks, setTasks] = useState([]);
const [categories, setCategories] = useState([]);
const [activeTab, setActiveTab] = useState('active');
const [selectedCategory, setSelectedCategory] = useState(null);
const [sortBy, setSortBy] = useState('category');
```

---

##  Docker e Deploy

### Docker Compose (Desenvolvimento Local)

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    volumes:
      - ./data:/app/data
      - ./python:/app
    healthcheck:
      test: ["CMD", "curl", "-f", "http://0.0.0.0:8000/health"]

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:80"
    depends_on:
      backend:
        condition: service_healthy
```

**Comandos:**
```bash
# Subir a aplicação
docker-compose up --build

# Parar
docker-compose down

# Ver logs
docker-compose logs -f
```

### Deploy no Google Cloud Run

**Backend:**
```bash
gcloud run deploy todolist-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**Frontend:**
```bash
gcloud run deploy todolist-frontend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Como Executar Localmente

### Pré-requisitos
- Python 3.11+
- Node.js 20+
- Docker (opcional)

### Opção 1: Com Docker Compose
```bash
# Clone o repositório
git clone <repo-url>
cd todolist

# Inicie os containers
docker-compose up --build

# Acesse:
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Docs: http://localhost:8000/docs
```

### Opção 2: Manualmente

**Backend:**
```bash
cd python
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd js/todolist
npm install
npm run dev
# Acesse http://localhost:5173
```

---

##  Configuração

### Variáveis de Ambiente

**Backend (python/core/config.py):**
```python
ALGORITHM = "HS256"
SECRET_KEY = "your_secret_key_here"  # ⚠️ Alterar em produção!
ACCESS_TOKEN_EXPIRE_MINUTES = 30
```

**Frontend (js/todolist/src/services/api.js):**
```javascript
const BASE_URL = "https://todolist-backend-...run.app";
// Ou para local: "http://localhost:8000"
```

---

##  Fluxo de Dados

### Criação de Tarefa

```
1. Usuário preenche modal
   ↓
2. TasksPage.handleCreateTask()
   ↓
3. api.createTask(task) → POST /tasks
   ↓
4. Backend valida com Pydantic (TaskCreate)
   ↓
5. tasks_repo.create_task() → INSERT INTO tasks
   ↓
6. Retorna ID da tarefa criada
   ↓
7. Frontend recarrega lista → loadTasks()
   ↓
8. UI atualiza com nova tarefa
```

### Autenticação

```
1. LoginPage: usuário digita email/senha
   ↓
2. api.login() → POST /login
   ↓
3. Backend valida credenciais
   ↓
4. create_access_token() → JWT gerado
   ↓
5. Token armazenado: localStorage.setItem('access_token', token)
   ↓
6. Requisições futuras incluem: Authorization: Bearer {token}
   ↓
7. Backend valida token em get_current_user()
```

---

## Recursos Implementados

###  Funcionalidades Completas

-  Autenticação JWT com registro e login
-  CRUD completo de tarefas
-  Subtarefas com toggle individual
-  Categorias personalizadas com cores
-  Filtros por categoria e data
-  Ordenação por categoria ou data
-  Tabs de tarefas ativas/concluídas
-  Barra de progresso de conclusão
-  Edição inline de tarefas
-  Modal de confirmação para exclusão
- Datas de vencimento
- Design responsivo e moderno
- Bypass de desenvolvimento

---

---

**Última atualização**: Janeiro 2026

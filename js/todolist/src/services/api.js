const BASE_URL = "http://localhost:8000";

class ApiService {
  async login(email, password) {
    const body = new URLSearchParams();
    body.append("username", email);
    body.append("password", password);

    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body.toString()
    });
    
    if (!res.ok) {
      throw new Error("Invalid credentials");
    }

    const data = await res.json();
    localStorage.setItem("access_token", data.access_token);
    return data;
  }

  async register(name, email, password) {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Register failed");
    }

    return await res.json();
  }

  async fetchTasks() {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BASE_URL}/tasks`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch tasks");
    }
    
    return await res.json();
  }

  async createTask(task) {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BASE_URL}/tasks`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(task)
    });
    
    if (!res.ok) {
      throw new Error("Failed to create task");
    }
    
    return await res.json();
  }

  async updateTask(taskId, task) {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(task)
    });
    
    if (!res.ok) {
      throw new Error("Failed to update task");
    }
    
    return await res.json();
  }

  async deleteTask(taskId) {
    const token = localStorage.getItem("access_token");
    const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!res.ok) {
      throw new Error("Failed to delete task");
    }
    
    return await res.json();
  }

  logout() {
    localStorage.removeItem("access_token");
  }
}

export default new ApiService();
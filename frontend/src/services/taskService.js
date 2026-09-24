import api from "./api";

export const taskService = {
  // Get all tasks
  getTasks: async (params = {}) => {
    const response = await api.get("/tasks", { params });
    return response.data.data;
  },

  // Get task by ID
  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data.data.task;
  },

  // Create new task
  createTask: async (taskData) => {
    const response = await api.post("/tasks", taskData);
    return response.data.data.task;
  },

  // Update task
  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data.data.task;
  },

  // Delete task
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  // Get task statistics
  getTaskStats: async () => {
    const response = await api.get("/tasks/stats");
    return response.data.data.stats;
  },
};

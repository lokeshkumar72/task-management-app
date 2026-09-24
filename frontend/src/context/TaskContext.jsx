import React, { createContext, useState, useEffect, useCallback } from "react";
import { taskService } from "../services/taskService";
import { useSocket } from "../hooks/useSocket";

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    todo: 0,
    inprogress: 0,
    completed: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const socket = useSocket();

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskService.getTasks(filters);
      setTasks(data.tasks);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await taskService.getTaskStats();
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  // Load tasks on mount and when filters change
  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    socket.on("taskCreated", (newTask) => {
      setTasks((prev) => [newTask, ...prev]);
      fetchStats();
    });

    socket.on("taskUpdated", (updatedTask) => {
      setTasks((prev) =>
        prev.map((task) => (task._id === updatedTask._id ? updatedTask : task))
      );
      fetchStats();
    });

    socket.on("taskDeleted", ({ taskId }) => {
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      fetchStats();
    });

    return () => {
      socket.off("taskCreated");
      socket.off("taskUpdated");
      socket.off("taskDeleted");
    };
  }, [socket, fetchStats]);

  // Create task
  const createTask = async (taskData) => {
    try {
      setError(null);
      const newTask = await taskService.createTask(taskData);
      return newTask;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create task";
      setError(message);
      throw new Error(message);
    }
  };

  // Update task
  const updateTask = async (id, taskData) => {
    try {
      setError(null);
      const updatedTask = await taskService.updateTask(id, taskData);
      return updatedTask;
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update task";
      setError(message);
      throw new Error(message);
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    try {
      setError(null);
      await taskService.deleteTask(id);
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete task";
      setError(message);
      throw new Error(message);
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  // Change page
  const changePage = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const value = {
    tasks,
    stats,
    loading,
    error,
    filters,
    pagination,
    createTask,
    updateTask,
    deleteTask,
    updateFilters,
    changePage,
    refreshTasks: fetchTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

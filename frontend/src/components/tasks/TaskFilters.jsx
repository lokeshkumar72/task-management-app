import React, { useState } from "react";
import { useTasks } from "../../hooks/useTasks";
import Button from "../common/Button";

const TaskFilters = ({ onCreateClick }) => {
  const { filters, updateFilters } = useTasks();
  const [search, setSearch] = useState(filters.search || "");

  const handleStatusChange = (status) => {
    updateFilters({ status: filters.status === status ? "" : status });
  };

  const handlePriorityChange = (priority) => {
    updateFilters({ priority: filters.priority === priority ? "" : priority });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search });
  };

  const handleClearFilters = () => {
    setSearch("");
    updateFilters({ status: "", priority: "", search: "" });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </form>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStatusChange("todo")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filters.status === "todo"
                ? "bg-yellow-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            To Do
          </button>
          <button
            onClick={() => handleStatusChange("inprogress")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filters.status === "inprogress"
                ? "bg-orange-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => handleStatusChange("completed")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filters.status === "completed"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Completed
          </button>
        </div>

        {/* Priority Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handlePriorityChange("high")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filters.priority === "high"
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            High
          </button>
          <button
            onClick={() => handlePriorityChange("medium")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filters.priority === "medium"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => handlePriorityChange("low")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filters.priority === "low"
                ? "bg-gray-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Low
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
          <Button variant="primary" onClick={onCreateClick}>
            + New Task
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;

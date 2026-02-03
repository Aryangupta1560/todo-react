import React, { useState, useEffect } from "react";

function App() {
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("myTasks");
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage, setTasksPerPage] = useState(5);
  const [filterType, setFilterType] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalText, setModalText] = useState("");

  useEffect(() => {
    localStorage.setItem("myTasks", JSON.stringify(tasks));
  }, [tasks]);

// Add these useEffects to reset fields
useEffect(() => {
  if (filterType !== "text") {
    setSearchText("");
    setSearchDate("");
  }
}, [filterType]);

// Fixed filter logic - only apply when field has value
const activeTasks = tasks.filter((t) => {
  if (t.deletedAt) return false;
  
  // Text filter: only if filterType matches AND searchText has content
  if (filterType === "text" && searchText.trim()) {
    return t.text.toLowerCase().includes(searchText.toLowerCase());
  }
  
  // Date filter: only if filterType matches AND searchDate has value
  if (filterType === "date" && searchDate) {
    return t.createdAt === searchDate;
  }
  
  // Page size is handled separately, not here
  return true;
});


  useEffect(() => {
    setCurrentPage(1);
  }, [tasksPerPage, filterType, searchText, searchDate]);

  useEffect(() => {
    const totalPages = Math.ceil(activeTasks.length / tasksPerPage) || 1;
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [activeTasks.length, currentPage, tasksPerPage]);

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = activeTasks.slice(indexOfFirstTask, indexOfLastTask);

  const addTask = () => {
    if (!task.trim()) {
      // Add visual feedback for empty task
      const input = document.querySelector('input[placeholder="Enter a task"]');
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 500);
      return;
    }

    const newTask = {
      id: Date.now(),
      text: task,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: null,
      deletedAt: null,
    };

    const updatedTasks = [newTask, ...tasks];
    setTasks(updatedTasks);
    setTask("");

    // Visual feedback for adding task
    const addBtn = document.querySelector('button:contains("ADD")');
    if (addBtn) {
      addBtn.classList.add('pulse');
      setTimeout(() => addBtn.classList.remove('pulse'), 300);
    }

    setCurrentPage(1);
  };

  const deleteTask = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? { ...t, deletedAt: new Date().toISOString().split("T")[0] }
          : t
      )
    );
    
    // Visual feedback
    const deleteBtn = event?.target;
    if (deleteBtn) {
      deleteBtn.classList.add('scale-down');
      setTimeout(() => deleteBtn.classList.remove('scale-down'), 300);
    }
  };

  const editTask = (id) => {
    const taskToEdit = tasks.find((t) => t.id === id);
    if (!taskToEdit) return;
    setEditId(id);
    setModalText(taskToEdit.text);
    setIsModalOpen(true);
  };

  const updateTaskFromModal = () => {
    if (!modalText.trim()) return;
    setTasks(
      tasks.map((t) =>
        t.id === editId
          ? {
              ...t,
              text: modalText,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : t
      )
    );
    setIsModalOpen(false);
    setEditId(null);
    setModalText("");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsModalOpen(false);
      }
      if (e.key === "Enter" && !isModalOpen && document.activeElement.type !== "text") {
        document.querySelector('input[placeholder="Enter a task"]')?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Add CSS for animations
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      @keyframes scaleDown {
        0% { transform: scale(1); }
        100% { transform: scale(0.9); }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .shake { animation: shake 0.5s ease-in-out; }
      .pulse { animation: pulse 0.3s ease-in-out; }
      .scale-down { animation: scaleDown 0.3s ease-in-out; }
      .fade-in { animation: fadeIn 0.3s ease-out; }
      .glass-effect {
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }
      .task-row:hover {
        background: linear-gradient(90deg, #f0f9ff, #e0f2fe);
        transform: translateX(5px);
        transition: all 0.2s ease;
      }
      .gradient-bg {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      .gradient-text {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex justify-center items-center p-4 md:p-6">
      <div className="w-full max-w-6xl fade-in">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl text-gray-600   -bold mb-3">My Tasks 📑</h1>
          <p className="text-gray-600 text-lg">Stay organized. Stay productive.</p>
          <div className="flex justify-center gap-2 mt-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              Total: {tasks.filter(t => !t.deletedAt).length}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              Active: {activeTasks.length}
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="glass-effect rounded-3xl shadow-2xl p-6 md:p-8 mb-8">
          {/* Input Section */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="✏️ Enter a new task..."
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addTask();
                  }}
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border--500 focus:ring-4 focus:ring-gray-500 outline-none transition-all duration-300 shadow-lg"
                />
                {task && (
                  <button
                    onClick={() => setTask("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                onClick={addTask}
                className="bg-gradient-to-r from-gray-400 to-gray-300 text-white px-8 py-4 rounded-2xl hover:from-gray-400 hover:to-gray-400 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg"
              >
                ➕ ADD TASK
              </button>
            </div>

            {/* Filters Section */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 font-medium">Filter by:</span>
                <select
  value={filterType}
  onChange={(e) => {
    setFilterType(e.target.value);
    // Reset page too for clean state
    setCurrentPage(1);
  }}
  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white shadow"
>
  <option value="all">All Tasks</option>
  <option value="text">Filter by Text</option>
  <option value="date">Filter by Date</option>
  <option value="page">Items per Page</option>
</select>

              </div>

              {filterType === "text" && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder=" Search tasks..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none shadow pl-10"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </span>
                </div>
              )}

              {filterType === "date" && (
                <div className="relative">
                  <input
                    type="date"
                    value={searchDate}
                    onChange={(e) => setSearchDate(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none shadow pl-4"
                  />
                </div>
              )}

              {filterType === "page" && (
                <select
                  value={tasksPerPage}
                  onChange={(e) => setTasksPerPage(Number(e.target.value))}
                  className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white shadow"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              )}

              {activeTasks.length > 0 && (
                <div className="ml-auto text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  Showing {indexOfFirstTask + 1}-{Math.min(indexOfLastTask, activeTasks.length)} of {activeTasks.length}
                </div>
              )}
            </div>
          </div>

          {/* Tasks Table */}
          {activeTasks.length > 0 ? (
            <>
              <div className="overflow-hidden rounded-2xl shadow-lg border border-gray-100">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-500 to-gray-500 text-white">
                    <tr>
                      <th className="p-4 text-left font-semibold">#</th>
                      <th className="p-4 text-left font-semibold">Task</th>
                      <th className="p-4 text-left font-semibold">Created</th>
                      <th className="p-4 text-left font-semibold">Updated</th>
                      <th className="p-4 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTasks.map((t, index) => (
                      <tr
                        key={t.id}
                        className="task-row border-b border-gray-100 last:border-b-0"
                      >
                        <td className="p-4 font-medium text-gray-700">
                          <div className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full">
                            {index + indexOfFirstTask + 1}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${t.updatedAt ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                            <span className="font-medium">{t.text}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600">
                          <div className="flex items-center gap-2">
                            <span>📅</span>
                            <span>{t.createdAt}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {t.updatedAt ? (
                            <div className="flex items-center gap-2 text-green-600">
                              <span>🔄</span>
                              <span>{t.updatedAt}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => editTask(t.id)}
                              className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-all duration-200 hover:scale-110"
                              title="Edit task"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => deleteTask(t.id)}
                              className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl transition-all duration-200 hover:scale-110"
                              title="Delete task"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8">
                <div className="text-sm text-gray-600">
                  Showing {Math.min(tasksPerPage, activeTasks.length)} tasks per page
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-all duration-200 flex items-center gap-2"
                  >
                    ◀ Previous
                  </button>
                  
                  <div className="flex gap-2">
                    {Array.from({ length: Math.ceil(activeTasks.length / tasksPerPage) }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === Math.ceil(activeTasks.length / tasksPerPage) ||
                        Math.abs(page - currentPage) <= 2
                      )
                      .map((page, i, arr) => (
                        <React.Fragment key={page}>
                          {i > 0 && arr[i-1] !== page-1 && <span className="px-2">...</span>}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-xl transition-all duration-200 ${currentPage === page ? 'gradient-bg text-white shadow-lg' : 'bg-gray-100 hover:bg-gray-200'}`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={indexOfLastTask >= activeTasks.length}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl transition-all duration-200 flex items-center gap-2"
                  >
                    Next ▶
                  </button>
                </div>
                
                <div className="text-sm font-medium text-gray-700">
                  Page {currentPage} of {Math.ceil(activeTasks.length / tasksPerPage) || 1}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No tasks yet</h3>
              <p className="text-gray-500 mb-6">Start by adding your first task above!</p>
              <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden fade-in">
            <div className="gradient-bg p-6">
              <h2 className="text-2xl font-bold text-white">Edit Task ✏️</h2>
              <p className="text-white/80">Update your task below</p>
            </div>
            
            <div className="p-6">
              <textarea
                value={modalText}
                onChange={(e) => setModalText(e.target.value)}
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-300 resize-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) updateTaskFromModal();
                }}
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={updateTaskFromModal}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 rounded-xl transition-all duration-200 font-medium shadow-lg"
                >
                  Save Changes
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-4 text-center">
                
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-4 left-1/2 transform -translateX(1/2) text-center text-gray-500 text-sm">
        <p>Tasks are automatically saved to your browser's storage</p>
      </div>
    </div>
  );
}

export default App;
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
    //aryan

    const [filterType, setFilterType] = useState("all");
    const [searchText, setSearchText] = useState("");
    const [searchDate, setSearchDate] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalText, setModalText] = useState("");

    useEffect(() => {
      localStorage.setItem("myTasks", JSON.stringify(tasks));
    }, [tasks]);

    const activeTasks = tasks.filter((t) => {
      if (t.deletedAt) return false;
      if (filterType === "text" && searchText)
        return t.text.toLowerCase().includes(searchText.toLowerCase());
      if (filterType === "date" && searchDate) return t.createdAt === searchDate;
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
  if (!task.trim()) return;

  const newTask = {
    id: Date.now(),
    text: task,
    createdAt: new Date().toISOString().split("T")[0],
    updatedAt: null,
    deletedAt: null,
  };

  const updatedTasks = [newTask, ...tasks];
  //aryan2
  setTasks(updatedTasks);
  setTask("");

  // 👉 Calculate which page the new task belongs to
  const activeCount = updatedTasks.filter((t) => !t.deletedAt).length;
  const lastPage = Math.ceil(activeCount / tasksPerPage);

  setCurrentPage(1); // 🔥 Jump to that page
};


    const deleteTask = (id) => {
      setTasks(
        tasks.map((t) =>
          t.id === id
            ? { ...t, deletedAt: new Date().toISOString().split("T")[0] }
            : t
        )
      );
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
  };

  if (isModalOpen) {
    window.addEventListener("keydown", handleKeyDown);
  }

  return () => window.removeEventListener("keydown", handleKeyDown);
}, [isModalOpen]);


    return (
      <div className="min-h-screen bg-gradient-to-br from-SKY-300 to-purple-200 flex justify-center items-center p-5">
        <div className="w-full max-w-5xl">
    {/* <div className="bg-white w-full max-w-5xl rounded-xl shadow-2xl p-6"></div> */}
        <div className="mb-6 text-left">
  <h1 className="text-4xl font-bold text-gray-800">My Tasks 📑</h1>
  <p className="text-gray-500 text-sm">Stay organized. Stay productive.</p>
</div>


          {/* Top Bar */}
          <div className="flex flex-wrap justify-between gap-3 mb-4">
            <div className="flex gap-2">
             <input
  type="text"
 placeholder="Enter a task"
  value={task}
  onChange={(e) => setTask(e.target.value)}
  onKeyDown={(e) => {
    if (e.key === "Enter") addTask();
  }}
                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none w-50 shadow-sm"

/>
              <button
                onClick={addTask}
                className="bg-indigo-900 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                ADD
              </button>
            </div>

            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border rounded px-2 py-2"
              >
                <option value="all">Filter</option>
                <option value="text">Search by Text</option>
                <option value="date">Search by Date</option>
                <option value="page">Set Page Size</option>
              </select>

              {filterType === "text" && (
                <input
                  type="text"
                  placeholder="Search task..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none w-50 shadow-sm"
                />
              )}

              {filterType === "date" && (
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none w-50 shadow-sm"
                />
              )}

              {filterType === "page" && (
                <select
                  value={tasksPerPage}
                  onChange={(e) => setTasksPerPage(Number(e.target.value))}
                className="px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none w-50 shadow-sm"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              )}
            </div>
          </div>

          {/* Table */}
          <table className="w-full border rounded-lg overflow-hidden backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/40">
            <thead className="bg-sky-200">
              <tr>
                <th className="p-3">Sr. No.</th>
                <th className="p-3">Task</th>
                <th className="p-3">Created</th>
                <th className="p-3">Updated</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTasks.map((t, index) => (
                <tr
    key={t.id}
    className="text-center border-t hover:bg-gray-50 transition duration-200"
  >
                  <td className="p-2">{index + indexOfFirstTask + 1}</td>
                  <td className="p-2">{t.text}</td>
                  <td className="p-2">{t.createdAt}</td>
                  <td className="p-2">{t.updatedAt || "-"}</td>
                  <td className="p-2">
                    <button
                      onClick={() => editTask(t.id)}
                      className="bg-yellow-400 px-2 py-1 rounded mr-2"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteTask(t.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-3 mt-4">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              ⬅
            </button>

            <span className="font-medium">
              Page {currentPage} of {Math.ceil(activeTasks.length / tasksPerPage) || 1}
            </span>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={indexOfLastTask >= activeTasks.length}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              ➡
            </button>
          </div>
        </div>

        {/* Modal */}
       {isModalOpen && (
<div
  className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
  onClick={() => setIsModalOpen(false)}
>
<div
  className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-2xl"
  onClick={(e) => e.stopPropagation()}
>
      <h2 className="text-lg font-semibold mb-4 text-gray-800">Edit Task</h2>

      <input
        type="text"
        value={modalText}
        onChange={(e) => setModalText(e.target.value)}
        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none shadow-sm"
      />

      <div className="flex justify-end gap-3 mt-5">
        <button
          onClick={updateTaskFromModal}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
        >
          Save
        </button>
        <button
          onClick={() => setIsModalOpen(false)}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    );
  }

  export default App;

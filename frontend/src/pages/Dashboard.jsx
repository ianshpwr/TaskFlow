import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "DONE"];

const statusClass = {
  PENDING: "badge badge-pending",
  IN_PROGRESS: "badge badge-progress",
  DONE: "badge badge-done",
};

const emptyForm = { title: "", description: "", status: "PENDING" };

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [tasks, setTasks] = useState([]);
  const [alert, setAlert] = useState(null);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);

  // ── Fetch tasks ────────────────────────────────────────────────────────────
  const fetchTasks = async () => {
    try {
      const { data } = await api.get("/tasks");
      setTasks(data.data);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
      } else {
        showAlert("error", err.response?.data?.message || "Failed to load tasks");
      }
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
      return;
    }
    fetchTasks();
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ── Create task ────────────────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await api.post("/tasks", createForm);
      setTasks((prev) => [data.data, ...prev]);
      setCreateForm(emptyForm);
      showAlert("success", "Task created!");
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  // ── Delete task ────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showAlert("success", "Task deleted.");
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to delete task");
    }
  };

  // ── Edit task ──────────────────────────────────────────────────────────────
  const startEdit = (task) => {
    setEditingId(task.id);
    setEditForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const handleUpdate = async (id) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, editForm);
      setTasks((prev) => prev.map((t) => (t.id === id ? data.data : t)));
      cancelEdit();
      showAlert("success", "Task updated.");
    } catch (err) {
      showAlert("error", err.response?.data?.message || "Failed to update task");
    }
  };

  return (
    <div className="dashboard">
      {/* ── Navbar ── */}
      <header className="navbar">
        <span className="navbar-brand">TaskFlow</span>
        <div className="navbar-right">
          <span className="navbar-user">👤 {user.name || "User"}</span>
          <button className="btn btn-logout" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {alert && (
          <div className={`alert alert-${alert.type} alert-top`}>
            {alert.msg}
          </div>
        )}

        {/* ── Create Task Form ── */}
        <section className="card create-card">
          <h2>New Task</h2>
          <form onSubmit={handleCreate} className="create-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="c-title">Title</label>
                <input
                  id="c-title"
                  type="text"
                  placeholder="Task title (min 3 chars)"
                  value={createForm.title}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="c-status">Status</label>
                <select
                  id="c-status"
                  value={createForm.status}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="c-desc">Description (optional)</label>
              <textarea
                id="c-desc"
                placeholder="Task description…"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, description: e.target.value }))
                }
                rows={2}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? "Creating…" : "Add Task"}
            </button>
          </form>
        </section>

        {/* ── Task Cards ── */}
        <section className="tasks-section">
          <h2>
            My Tasks{" "}
            <span className="task-count">{tasks.length}</span>
          </h2>

          {tasks.length === 0 ? (
            <p className="empty-state">No tasks yet. Create one above!</p>
          ) : (
            <div className="tasks-grid">
              {tasks.map((task) =>
                editingId === task.id ? (
                  /* ── Edit Card ── */
                  <div key={task.id} className="task-card task-card--editing">
                    <div className="form-group">
                      <label>Title</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, title: e.target.value }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                        rows={2}
                      />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, status: e.target.value }))
                        }
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="card-actions">
                      <button
                        className="btn btn-save"
                        onClick={() => handleUpdate(task.id)}
                      >
                        Save
                      </button>
                      <button className="btn btn-cancel" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── View Card ── */
                  <div key={task.id} className="task-card">
                    <div className="task-card-header">
                      <h3 className="task-title">{task.title}</h3>
                      <span className={statusClass[task.status]}>
                        {task.status.replace("_", " ")}
                      </span>
                    </div>
                    {task.description && (
                      <p className="task-desc">{task.description}</p>
                    )}
                    <p className="task-meta">
                      {new Date(task.createdAt).toLocaleDateString()}
                    </p>
                    <div className="card-actions">
                      <button
                        className="btn btn-edit"
                        onClick={() => startEdit(task)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDelete(task.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

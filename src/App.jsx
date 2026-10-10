import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "daymark-todos";
const FILTERS = [
  { id: "all", label: "All tasks", icon: "○" },
  { id: "active", label: "To do", icon: "◷" },
  { id: "completed", label: "Completed", icon: "✓" },
];

function readTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function App() {
  const [tasks, setTasks] = useState(readTasks);
  const [filter, setFilter] = useState("all");
  const [draft, setDraft] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const remaining = tasks.filter((task) => !task.completed).length;
  const completed = tasks.length - remaining;
  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (filter === "active") return !task.completed;
        if (filter === "completed") return task.completed;
        return true;
      }),
    [filter, tasks],
  );

  function addTask(event) {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setTasks((current) => [
      { id: `${Date.now()}-${Math.random()}`, title, completed: false },
      ...current,
    ]);
    setDraft("");
  }

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function deleteTask(id) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function clearCompleted() {
    setTasks((current) => current.filter((task) => !task.completed));
  }

  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="Daymark home">
          <span className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
          <span>daymark</span>
        </a>

        <div className="sidebar-section">
          <p className="sidebar-heading">WORKSPACE</p>
          <nav className="filter-list" aria-label="Task filters">
            {FILTERS.map((item) => (
              <button
                className={`filter-button ${filter === item.id ? "selected" : ""}`}
                key={item.id}
                onClick={() => setFilter(item.id)}
                aria-current={filter === item.id ? "page" : undefined}
              >
                <span className="filter-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
                <span className="filter-count">
                  {item.id === "all"
                    ? tasks.length
                    : item.id === "active"
                      ? remaining
                      : completed}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebar-note">
          <div className="note-sparkle" aria-hidden="true">✳</div>
          <p className="note-title">Small steps count.</p>
          <p className="note-copy">
            You don&apos;t have to do it all. Just the next thing.
          </p>
          <div className="note-decoration" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>

        <div className="sidebar-footer">
          <span className="avatar">Y</span>
          <span className="footer-label">Your personal space</span>
          <span className="footer-dots" aria-hidden="true">···</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span className="breadcrumb">My workspace <span>/</span> Today</span>
          <span className="today-date">{today}</span>
        </header>

        <section className="task-page" aria-labelledby="page-title">
          <div className="page-heading">
            <div>
              <p className="eyebrow">YOUR DAY, AT A GLANCE</p>
              <h1 id="page-title">
                {filter === "completed"
                  ? "Nicely done."
                  : filter === "active"
                    ? "Things to do."
                    : "Today"}
                <span className="heading-sparkle" aria-hidden="true">✳</span>
              </h1>
              <p className="heading-subtitle">
                {remaining === 0
                  ? "A clear list is a lovely place to be."
                  : `You've got ${remaining} ${remaining === 1 ? "thing" : "things"} on your list. One step at a time.`}
              </p>
            </div>
            <div className="date-stamp" aria-label={today}>
              <span className="date-stamp-month">
                {new Intl.DateTimeFormat("en", { month: "short" })
                  .format(new Date())
                  .toUpperCase()}
              </span>
              <span className="date-stamp-day">{new Date().getDate()}</span>
              <span className="date-stamp-line" />
            </div>
          </div>

          <div className="progress-card">
            <div className="progress-copy">
              <span className="progress-icon" aria-hidden="true">✦</span>
              <div>
                <p className="progress-title">
                  {completed === 0
                    ? "Your day is just getting started"
                    : completed === tasks.length
                      ? "You did it — look at you go!"
                      : "Look at you making progress"}
                </p>
                <p className="progress-caption">
                  {tasks.length === 0
                    ? "Add a task and make today yours."
                    : `${completed} of ${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} complete`}
                </p>
              </div>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Tasks completed"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-percent">{progress}%</span>
          </div>

          <form className="add-task-form" onSubmit={addTask}>
            <span className="add-icon" aria-hidden="true">+</span>
            <label className="visually-hidden" htmlFor="new-task">
              Add a task
            </label>
            <input
              id="new-task"
              type="text"
              placeholder="Add a task to your day..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={180}
            />
            <button className="add-button" type="submit" disabled={!draft.trim()}>
              Add task <span aria-hidden="true">↗</span>
            </button>
          </form>

          <div className="list-toolbar">
            <div className="list-label">
              <span className="list-label-dot" />
              <h2>
                {filter === "active"
                  ? "Up next"
                  : filter === "completed"
                    ? "Finished"
                    : "Your list"}
              </h2>
              <span className="list-total">{visibleTasks.length}</span>
            </div>
            {completed > 0 && (
              <button className="clear-button" onClick={clearCompleted}>
                Clear completed
              </button>
            )}
          </div>

          <div className="task-list">
            {visibleTasks.length > 0 ? (
              visibleTasks.map((task) => (
                <article
                  className={`task-item ${task.completed ? "is-completed" : ""}`}
                  key={task.id}
                >
                  <button
                    className="task-checkbox"
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    aria-label={
                      task.completed
                        ? `Mark "${task.title}" as incomplete`
                        : `Mark "${task.title}" as complete`
                    }
                    aria-pressed={task.completed}
                  >
                    {task.completed && <span aria-hidden="true">✓</span>}
                  </button>
                  <span className="task-title">{task.title}</span>
                  {task.completed && <span className="done-label">DONE</span>}
                  <button
                    className="delete-button"
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    aria-label={`Delete "${task.title}"`}
                  >
                    ×
                  </button>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <span className="empty-illustration" aria-hidden="true">
                  {filter === "completed" ? "✿" : filter === "active" ? "☀" : "✳"}
                </span>
                <p className="empty-title">
                  {filter === "completed"
                    ? "Nothing checked off just yet"
                    : filter === "active"
                      ? "All caught up!"
                      : "A fresh page"}
                </p>
                <p className="empty-copy">
                  {filter === "completed"
                    ? "Finished tasks will find a home here."
                    : filter === "active"
                      ? "Enjoy the breathing room, or add something new."
                      : "Add your first task above and get going."}
                </p>
              </div>
            )}
          </div>

          <footer className="list-footer">
            <span>
              <span className="keyboard-hint">↵</span> Press enter to add a task
            </span>
            <span>Made for your everyday <span className="footer-heart">♥</span></span>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;

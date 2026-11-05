"use client";

import { useEffect, useState } from "react";
import AssignmentControls from "./assignment-controls";

const columns = [
  {
    key: "pending",
    label: "To do",
    description: "Ready when you are",
  },
  {
    key: "in_progress",
    label: "In progress",
    description: "Keep the momentum",
  },
  {
    key: "completed",
    label: "Completed",
    description: "One step closer",
  },
];

function localToday() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
}

function daysBetween(date, today) {
  if (!today) return NaN;

  const toUTC = (value) => {
    const [year, month, day] = value.split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  };

  return Math.round((toUTC(date) - toUTC(today)) / 86400000);
}

function formatDate(value) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function matchesDeadline(item, filter, today) {
  if (filter === "all") return true;
  if (item.status === "completed") return false;

  const days = daysBetween(item.due_date, today);

  if (filter === "overdue") return days < 0;
  if (filter === "today") return days === 0;

  return days > 0 && days <= 7;
}

export default function Home() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [today, setToday] = useState("");
  const [search, setSearch] = useState("");
  const [course, setCourse] = useState("all");
  const [deadline, setDeadline] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  function refreshAssignments() {
    setRefreshKey((current) => current + 1);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadAssignments() {
      setError("");

      try {
        const response = await fetch("/api/assignments", {
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load assignments.");
        }

        if (!Array.isArray(data.assignments)) {
          throw new Error("The API returned an unexpected response.");
        }

        setAssignments(data.assignments);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load assignments.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    setToday(localToday());
    loadAssignments();

    const timer = setInterval(() => {
      setToday(localToday());
    }, 60000);

    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, [refreshKey]);

  const courses = [
    ...new Set(assignments.map((item) => item.course)),
  ].sort();

  const pending = assignments.filter(
    (item) => item.status === "pending"
  ).length;

  const inProgress = assignments.filter(
    (item) => item.status === "in_progress"
  ).length;

  const completed = assignments.filter(
    (item) => item.status === "completed"
  ).length;

  const progress = assignments.length
    ? Math.round((completed / assignments.length) * 100)
    : 0;

  const visible = assignments.filter((item) => {
    const text = `${item.title} ${item.course}`.toLowerCase();

    return (
      text.includes(search.trim().toLowerCase()) &&
      (course === "all" || item.course === course) &&
      matchesDeadline(item, deadline, today)
    );
  });

  const deadlines = [
    { key: "all", label: "All assignments" },
    { key: "overdue", label: "Overdue" },
    { key: "today", label: "Due today" },
    { key: "week", label: "Next 7 days" },
  ];

  const stats = [
    {
      label: "Total assignments",
      value: assignments.length,
      caption: "Everything in one place",
    },
    {
      label: "To do",
      value: pending,
      caption: "Your next starting point",
    },
    {
      label: "In progress",
      value: inProgress,
      caption: "Small steps count",
    },
    {
      label: "Completed",
      value: completed,
      caption: "Give yourself some credit",
    },
  ];

  return (
    <main className="workspace">
      <header className="topbar">
        <a className="brand" href="/" aria-label="StudyFlow home">
          <span className="brand-icon">sf</span>
          StudyFlow<span className="brand-dot">.</span>
        </a>

        <div className="header-actions">
          <span className="workspace-label">
            YOUR PERSONAL STUDY SPACE
          </span>

          {!loading && !error && (
            <AssignmentControls onChanged={refreshAssignments} />
          )}
        </div>
      </header>

      <section className="intro">
        <div>
          <p className="eyebrow">LESS STRESS. MORE PROGRESS.</p>
          <h1>Make room for your next win.</h1>
          <p className="subtitle">
            Organize your assignments, stay ahead of deadlines,
            and keep moving.
          </p>
        </div>

        {!loading && !error && (
          <span className="live-label">
            <span />
            Connected to MySQL
          </span>
        )}
      </section>

      {loading ? (
        <div className="message" role="status">
          Loading your workspace…
        </div>
      ) : error ? (
        <div className="message error" role="alert">
          <p>{error}</p>
          <p>Check the Terminal and make sure CAMPP is running.</p>
          <button
            type="button"
            className="small-button"
            onClick={refreshAssignments}
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <section className="stats" aria-label="Assignment summary">
            {stats.map((stat) => (
              <article className="stat" key={stat.label}>
                <p>{stat.label}</p>
                <strong>{stat.value}</strong>
                <small>{stat.caption}</small>
              </article>
            ))}
          </section>

          <div className="content-layout">
            <section
              className="board-area"
              aria-label="Assignment board"
            >
              <div className="section-heading">
                <div>
                  <p className="eyebrow">
                    YOUR WORK, AT A GLANCE
                  </p>
                  <h2>Assignment board</h2>
                </div>

                <span className="result-count">
                  {visible.length} showing
                </span>
              </div>

              <div className="filters">
                <input
                  aria-label="Search assignments"
                  placeholder="Search assignments or courses…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />

                <select
                  aria-label="Filter by course"
                  value={course}
                  onChange={(event) => setCourse(event.target.value)}
                >
                  <option value="all">All courses</option>

                  {courses.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="board">
                {columns.map((column) => {
                  const items = visible.filter(
                    (item) => item.status === column.key
                  );

                  return (
                    <section
                      className={`column ${column.key}`}
                      key={column.key}
                    >
                      <div className="column-heading">
                        <h3>
                          <span className="status-dot" />
                          {column.label}
                        </h3>

                        <span className="column-count">
                          {items.length}
                        </span>
                      </div>

                      <p className="column-description">
                        {column.description}
                      </p>

                      <div className="card-list">
                        {items.length === 0 && (
                          <div className="empty-column">
                            No assignments here.
                          </div>
                        )}

                        {items.map((item) => {
                          const overdue =
                            item.status !== "completed" &&
                            daysBetween(item.due_date, today) < 0;

                          return (
                            <article
                              className="assignment-card"
                              key={item.id}
                            >
                              <div className="card-top">
                                <span className="course-tag">
                                  {item.course}
                                </span>

                                <span
                                  className={`priority ${item.priority}`}
                                >
                                  {item.priority}
                                </span>
                              </div>

                              <h4>{item.title}</h4>

                              {item.notes && (
                                <p className="notes">
                                  {item.notes}
                                </p>
                              )}

                              <footer className="card-footer">
                                <time dateTime={item.due_date}>
                                  {formatDate(item.due_date)}
                                </time>

                                {overdue ? (
                                  <span className="overdue-tag">
                                    Overdue
                                  </span>
                                ) : item.status === "completed" ? (
                                  <span className="done-tag">
                                    Done ✓
                                  </span>
                                ) : null}
                              </footer>

                              <AssignmentControls
                                item={item}
                                onChanged={refreshAssignments}
                              />
                            </article>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </section>

            <aside className="sidebar">
              <section className="side-panel">
                <p className="eyebrow">
                  WHAT NEEDS ATTENTION
                </p>
                <h2>Deadline focus</h2>

                <p className="panel-description">
                  Choose a view to narrow your board.
                </p>

                <div className="deadline-list">
                  {deadlines.map((filter) => {
                    const count = assignments.filter((item) =>
                      matchesDeadline(item, filter.key, today)
                    ).length;

                    return (
                      <button
                        type="button"
                        key={filter.key}
                        className={
                          deadline === filter.key ? "active" : ""
                        }
                        aria-pressed={deadline === filter.key}
                        onClick={() => setDeadline(filter.key)}
                      >
                        <span>{filter.label}</span>
                        <strong>{count}</strong>
                      </button>
                    );
                  })}
                </div>

                <small className="helper">
                  Deadline counts exclude completed work,
                  except “All”.
                </small>
              </section>

              <section className="progress-panel">
                <p className="eyebrow">
                  ONE TASK AT A TIME
                </p>
                <h2>You’re making progress.</h2>

                <strong className="progress-number">
                  {progress}%
                </strong>

                <progress
                  aria-label="Overall assignment completion"
                  value={progress}
                  max="100"
                />

                <p>
                  {completed} of {assignments.length} assignments
                  completed.
                </p>
              </section>
            </aside>
          </div>

          <footer className="site-footer">
            StudyFlow · A little more organized, every day.
          </footer>
        </>
      )}
    </main>
  );
}
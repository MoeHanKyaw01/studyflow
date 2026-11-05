"use client";

import { useId, useRef, useState } from "react";

function emptyForm() {
  return {
    title: "",
    course: "",
    due_date: "",
    priority: "medium",
    status: "pending",
    notes: "",
  };
}

function itemValues(item) {
  return {
    title: item.title,
    course: item.course,
    due_date: item.due_date,
    priority: item.priority,
    status: item.status,
    notes: item.notes || "",
  };
}

export default function AssignmentControls({ item, onChanged }) {
  const dialogRef = useRef(null);
  const workingRef = useRef(false);
  const headingId = useId();
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function openForm() {
    setError("");
    setForm(item ? itemValues(item) : emptyForm());
    dialogRef.current.showModal();
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function mutate(method, values) {
    if (workingRef.current) return;

    workingRef.current = true;
    setBusy(true);
    setError("");

    try {
      const url = item
        ? `/api/assignments/${item.id}`
        : "/api/assignments";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        ...(values ? { body: JSON.stringify(values) } : {}),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save changes.");
      }

      dialogRef.current?.close();
      onChanged();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      workingRef.current = false;
      setBusy(false);
    }
  }

  function submitForm(event) {
    event.preventDefault();
    mutate(item ? "PUT" : "POST", form);
  }

  function changeStatus() {
    const nextStatus =
      item.status === "pending"
        ? "in_progress"
        : item.status === "in_progress"
          ? "completed"
          : "pending";

    mutate("PUT", {
      ...itemValues(item),
      status: nextStatus,
    });
  }

  function deleteAssignment() {
    const confirmed = window.confirm(
      `Delete "${item.title}"?\nThis permanently removes it from MySQL.`
    );

    if (confirmed) mutate("DELETE");
  }

  return (
    <div className={item ? "assignment-actions" : "add-control"}>
      {item ? (
        <div className="action-buttons">
          <button
            type="button"
            className="small-button status-button"
            disabled={busy}
            onClick={changeStatus}
          >
            {item.status === "pending"
              ? "Start →"
              : item.status === "in_progress"
                ? "Mark complete ✓"
                : "Reopen"}
          </button>

          <button
            type="button"
            className="small-button"
            disabled={busy}
            onClick={openForm}
          >
            Edit
          </button>

          <button
            type="button"
            className="small-button danger-button"
            disabled={busy}
            onClick={deleteAssignment}
          >
            Delete
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="primary-button"
          disabled={busy}
          onClick={openForm}
        >
          ＋ Add assignment
        </button>
      )}

      {error && (
        <p className="control-error" role="alert">{error}</p>
      )}

      <dialog
        className="assignment-dialog"
        ref={dialogRef}
        aria-labelledby={headingId}
        onCancel={(event) => {
          if (workingRef.current) event.preventDefault();
        }}
      >
        <div className="dialog-header">
          <div>
            <p className="eyebrow">MAKE YOUR NEXT MOVE</p>
            <h2 id={headingId}>
              {item ? "Edit assignment" : "New assignment"}
            </h2>
          </div>

          <button
            type="button"
            className="close-button"
            aria-label="Close form"
            disabled={busy}
            onClick={() => dialogRef.current.close()}
          >
            ×
          </button>
        </div>

        <form onSubmit={submitForm}>
          <fieldset className="form-fieldset" disabled={busy}>
            <label className="form-field">
              Assignment title
              <input
                autoFocus
                required
                maxLength={200}
                name="title"
                value={form.title}
                onChange={updateField}
                placeholder="e.g. Complete Docker assignment"
              />
            </label>

            <div className="form-grid">
              <label className="form-field">
                Course
                <input
                  required
                  maxLength={100}
                  name="course"
                  value={form.course}
                  onChange={updateField}
                  placeholder="e.g. DIT312"
                />
              </label>

              <label className="form-field">
                Due date
                <input
                  required
                  type="date"
                  min="1000-01-01"
                  max="9999-12-31"
                  name="due_date"
                  value={form.due_date}
                  onChange={updateField}
                />
              </label>
            </div>

            <div className="form-grid">
              <label className="form-field">
                Priority
                <select
                  name="priority"
                  value={form.priority}
                  onChange={updateField}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </label>

              <label className="form-field">
                Status
                <select
                  name="status"
                  value={form.status}
                  onChange={updateField}
                >
                  <option value="pending">To do</option>
                  <option value="in_progress">In progress</option>
                  <option value="completed">Completed</option>
                </select>
              </label>
            </div>

            <label className="form-field">
              Notes <span className="optional-label">(optional)</span>
              <textarea
                rows={4}
                maxLength={5000}
                name="notes"
                value={form.notes}
                onChange={updateField}
                placeholder="What do you need to remember?"
              />
            </label>

            {error && (
              <p className="control-error" role="alert">{error}</p>
            )}

            <div className="dialog-actions">
              <button
                type="button"
                className="small-button"
                onClick={() => dialogRef.current.close()}
              >
                Cancel
              </button>
              <button type="submit" className="primary-button">
                {busy ? "Saving…" : item ? "Save changes" : "Create assignment"}
              </button>
            </div>
          </fieldset>
        </form>
      </dialog>
    </div>
  );
}
export class InputError extends Error {}

export async function readAssignmentValues(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    throw new InputError("Please send valid JSON.");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new InputError("Invalid assignment data.");
  }

  const {
    title,
    course,
    due_date,
    priority = "medium",
    status = "pending",
    notes = "",
  } = body;

  if (typeof title !== "string" ||
      !title.trim() || title.trim().length > 200) {
    throw new InputError("Title is required and must be within 200 characters.");
  }

  if (typeof course !== "string" ||
      !course.trim() || course.trim().length > 100) {
    throw new InputError("Course is required and must be within 100 characters.");
  }

  if (typeof due_date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
    throw new InputError("Choose a valid due date.");
  }

  const parsedDate = new Date(`${due_date}T00:00:00Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== due_date ||
    Number(due_date.slice(0, 4)) < 1000
  ) {
    throw new InputError("Choose a valid due date.");
  }

  if (!["low", "medium", "high"].includes(priority)) {
    throw new InputError("Invalid priority.");
  }

  if (!["pending", "in_progress", "completed"].includes(status)) {
    throw new InputError("Invalid status.");
  }

  if (typeof notes !== "string" || notes.length > 5000) {
    throw new InputError("Notes must be within 5000 characters.");
  }

  return [
    title.trim(),
    course.trim(),
    due_date,
    priority,
    status,
    notes.trim(),
  ];
}

export async function readAssignmentId(params) {
  const { id } = await params;
  const number = Number(id);

  if (!/^[1-9]\d*$/.test(id) ||
      !Number.isSafeInteger(number) || number > 2147483647) {
    throw new InputError("Invalid assignment ID.");
  }

  return number;
}

export function apiError(error) {
  if (error instanceof InputError) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  console.error("Assignment API error:", error);

  return Response.json(
    { error: "Database operation failed. Please try again." },
    { status: 500 }
  );
}
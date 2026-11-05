import pool from "@/lib/db";
import {
  readAssignmentValues,
  apiError,
} from "@/lib/assignment-validation";

// Read all assignments
export async function GET() {
  try {
    const [assignments] = await pool.execute(`
      SELECT
        id, title, course, due_date,
        priority, status, notes,
        created_at, updated_at
      FROM assignments
      ORDER BY due_date ASC, id DESC
    `);

    return Response.json({ assignments });
  } catch (error) {
    return apiError(error);
  }
}

// Create an assignment
export async function POST(request) {
  try {
    const values = await readAssignmentValues(request);

    const [result] = await pool.execute(
      `INSERT INTO assignments
       (title, course, due_date, priority, status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      values
    );

    return Response.json(
      {
        message: "Assignment created.",
        id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    return apiError(error);
  }
}
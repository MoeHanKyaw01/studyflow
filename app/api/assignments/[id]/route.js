import pool from "@/lib/db";
import {
  readAssignmentValues,
  readAssignmentId,
  apiError,
} from "@/lib/assignment-validation";

// Update an assignment, including its status
export async function PUT(request, { params }) {
  try {
    const id = await readAssignmentId(params);
    const values = await readAssignmentValues(request);

    const [result] = await pool.execute(
      `UPDATE assignments
       SET title = ?,
           course = ?,
           due_date = ?,
           priority = ?,
           status = ?,
           notes = ?
       WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return Response.json(
        { error: "Assignment not found." },
        { status: 404 }
      );
    }

    return Response.json({ message: "Assignment updated." });
  } catch (error) {
    return apiError(error);
  }
}

// Delete an assignment
export async function DELETE(request, { params }) {
  try {
    const id = await readAssignmentId(params);

    const [result] = await pool.execute(
      "DELETE FROM assignments WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return Response.json(
        { error: "Assignment not found." },
        { status: 404 }
      );
    }

    return Response.json({ message: "Assignment deleted." });
  } catch (error) {
    return apiError(error);
  }
}
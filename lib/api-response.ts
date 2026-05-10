import { ZodError } from "zod";

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return Response.json(
      {
        error: "VALIDATION_ERROR",
        issues: error.issues,
      },
      { status: 400 },
    );
  }

  if (error instanceof Error) {
    const status =
      error.message === "UNAUTHORIZED"
          ? 401
          : error.message === "ITEM_NOT_FOUND"
            ? 404
            : error.message === "TRANSACTION_NOT_FOUND"
              ? 404
            : error.message === "EMAIL_ALREADY_IN_USE"
              ? 409
              : error.message === "INVALID_CREDENTIALS"
                ? 401
                : 500;

    return Response.json({ error: error.message }, { status });
  }

  return Response.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
}

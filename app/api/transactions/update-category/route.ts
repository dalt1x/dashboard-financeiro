import { transactionCategorySchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { updateTransactionCategory } from "@/server/dashboard-service";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = transactionCategorySchema.parse(await request.json());
    const transaction = await updateTransactionCategory(user.id, body.transactionId, body.category);
    return Response.json({ transaction });
  } catch (error) {
    return handleApiError(error);
  }
}

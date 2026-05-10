import { handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { transactionListSchema } from "@/lib/validators";
import { listTransactions } from "@/server/dashboard-service";

export async function GET(request: Request) {
  try {
    const user = await requireUser();
    const params = Object.fromEntries(new URL(request.url).searchParams.entries());
    const filters = transactionListSchema.parse(params);
    const result = await listTransactions(user.id, filters);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

import { handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { budgetUpsertSchema } from "@/lib/validators";
import { upsertMonthlyBudgets } from "@/server/dashboard-service";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = budgetUpsertSchema.parse(await request.json());
    const budgets = await upsertMonthlyBudgets(user.id, body.budgets, body.month);
    return Response.json({ budgets });
  } catch (error) {
    return handleApiError(error);
  }
}

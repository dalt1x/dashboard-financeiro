import { handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { getDashboardSummary } from "@/server/dashboard-service";

export async function GET() {
  try {
    const user = await requireUser();
    const summary = await getDashboardSummary(user.id);
    return Response.json(summary);
  } catch (error) {
    return handleApiError(error);
  }
}

import { handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { syncPlaidItem } from "@/server/plaid-service";

export async function POST() {
  try {
    const user = await requireUser();
    const result = await syncPlaidItem(user.id);
    return Response.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

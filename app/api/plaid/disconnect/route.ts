import { handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { disconnectAllPlaidItems } from "@/server/plaid-service";

export async function POST() {
  try {
    const user = await requireUser();
    await disconnectAllPlaidItems(user.id);
    return Response.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}

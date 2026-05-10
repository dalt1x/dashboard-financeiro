import { handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { getAccounts } from "@/server/dashboard-service";

export async function GET() {
  try {
    const user = await requireUser();
    const accounts = await getAccounts(user.id);
    return Response.json({ accounts });
  } catch (error) {
    return handleApiError(error);
  }
}

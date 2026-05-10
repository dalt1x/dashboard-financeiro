import { handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { createPlaidLinkToken } from "@/server/plaid-service";

export async function POST() {
  try {
    const user = await requireUser();
    const linkToken = await createPlaidLinkToken(user.id);
    return Response.json({ linkToken });
  } catch (error) {
    return handleApiError(error);
  }
}

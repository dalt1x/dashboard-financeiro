import { plaidExchangeSchema } from "@/lib/validators";
import { handleApiError } from "@/lib/api-response";
import { requireUser } from "@/lib/session";
import { exchangePublicToken } from "@/server/plaid-service";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = plaidExchangeSchema.parse(await request.json());
    const item = await exchangePublicToken(user.id, body.publicToken);
    return Response.json({ item });
  } catch (error) {
    return handleApiError(error);
  }
}

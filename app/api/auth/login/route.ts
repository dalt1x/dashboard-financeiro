import { createSession } from "@/lib/session";
import { handleApiError } from "@/lib/api-response";
import { loginUser } from "@/server/auth-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = await loginUser(body);
    await createSession(user);

    return Response.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}

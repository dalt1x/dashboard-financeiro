import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema, registerSchema } from "@/lib/validators";

export async function registerUser(input: unknown) {
  const data = registerSchema.parse(input);

  const existingUser = await db.user.findUnique({
    where: { email: data.email },
    select: { id: true },
  });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_IN_USE");
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  return db.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
}

export async function loginUser(input: unknown) {
  const data = loginSchema.parse(input);

  const user = await db.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  const isValid = await bcrypt.compare(data.password, user.passwordHash);

  if (!isValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

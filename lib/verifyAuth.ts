import { cookies } from "next/headers";
import { jwtVerify } from "jose";

interface DecodedToken {
  userId: string;
  email?: string;
  iat: number;
  exp: number;
}

export async function verifyAuth(): Promise<DecodedToken> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");
  
  if (!token?.value) {
    throw new Error("No authentication token found");
  }
  
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token.value, secret);
    
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      iat: payload.iat!,
      exp: payload.exp!
    };
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
}
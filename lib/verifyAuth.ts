import { cookies } from "next/headers";
import jwt from "jsonwebtoken"

interface DecodedToken {
  userId: string;
  email?: string;
  iat: number;
  exp: number;
}

export async function verifyAuth(): Promise<DecodedToken> {
      const cookieStore = cookies();

      const token=(await cookieStore).get("auth_token")
         if(!token?.value){ 
            throw new Error("No authentication token found");
        }
       try {
     
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET!) as DecodedToken;
    return decoded; // { userId, email, iat, exp }
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
    }
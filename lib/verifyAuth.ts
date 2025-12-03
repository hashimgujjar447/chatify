import { cookies } from "next/headers";
import jwt from "jsonwebtoken"


export async function verifyAuth(){
      const cookieStore = cookies();

      const token=(await cookieStore).get("auth_token")
         if(!token?.value){ 
            throw new Error("No authentication token found");
        }
       try {
     
    const decoded = jwt.verify(token.value, process.env.JWT_SECRET!);
    return decoded; // { userId, email, iat, exp }
  } catch (err) {
    throw new Error("Invalid or expired token");
  }
    }
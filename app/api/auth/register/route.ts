import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/ApiError";
import { sendMailNodemailer } from "@/lib/sendMailNodemailer";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt"

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RequestBody {
    email: string;
    password: string;
    name?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = (await req.json()) as RequestBody;
    if (!email) throw new ApiError("Email is required", 400);
    if (!password || password.length < 6) throw new ApiError("Password must be at least 6 characters", 400);

    const now = new Date();

    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      if (user.isVerified) {
        throw new ApiError("User already registered", 400);
      }

      // Check registration attempts
      if ((user.registrationAttempts ?? 0) >= 3) {
        const lastAttempt = user.lastRegistrationAttempt!;
        const diff = (now.getTime() - lastAttempt.getTime()) / 1000 / 60; // minutes
        if (diff < 60) {
          throw new ApiError(
            `Too many attempts. Try again after ${Math.ceil(60 - diff)} minutes`,
            429
          );
        } else {
          // Reset attempts after 1 hour
          user = await prisma.user.update({
            where: { id: user.id },
            data: { registrationAttempts: 0 }
          });
        }
      }

      // Increment attempts and generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(otpCode, 10);
      
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          registrationAttempts: { increment: 1 },
          lastRegistrationAttempt: now,
          otpCode: hashedOtp,
          otpCodeExpiration: new Date(Date.now() + 5 * 60 * 1000)
        }
      });

      // Send plain OTP via email
      await sendMailNodemailer(
        email,
        "Your OTP Code",
        `<h2>Email Verification</h2>
        <p>Your OTP code is: <strong>${otpCode}</strong></p>
        <p>This code will expire in 5 minutes.</p>`
      );
      return NextResponse.json({ success: true, email });

    } else {
      // Create new user
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = await bcrypt.hash(otpCode, 10);
      const hashedPassword = await bcrypt.hash(password, 10);
      
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          registrationAttempts: 1,
          lastRegistrationAttempt: now,
          otpCode: hashedOtp,
          otpCodeExpiration: new Date(Date.now() + 5 * 60 * 1000)
        }
      });

      // Send plain OTP via email
      await sendMailNodemailer(
        email,
        "Your OTP Code",
        `<h2>Email Verification</h2>
        <p>Your OTP code is: <strong>${otpCode}</strong></p>
        <p>This code will expire in 5 minutes.</p>`
      );
      return NextResponse.json({ success: true, email });
    }

  } catch (error) {
    console.error(error);
    if (error instanceof ApiError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

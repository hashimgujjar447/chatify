import {Resend} from "resend"
export async function sendMail(email: string, otp: string) {
    const resend = new Resend(process.env.RESEND_API_KEY)

    try {
        const { data, error } = await resend.emails.send({
            from: "onboarding@resend.dev", // Resend's verified test domain
            to: email,
            subject: "Your OTP Code",
            html: `<h1>Hello! Your OTP code is ${otp}</h1>`
        })

        if (error) {
            throw new Error(error.message)
        }

        return data
    } catch (error) {
        console.error("Failed to send email:", error)
        throw error
    }
}
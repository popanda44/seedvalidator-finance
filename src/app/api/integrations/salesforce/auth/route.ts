import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getSalesforceAuthUrl } from "@/lib/salesforce-auth"

export async function GET(req: NextRequest) {
    const session = await auth()

    if (!session?.user?.companyId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // Construct redirect URI based on current request origin to support both localhost and prod
        const redirectUri = `${req.nextUrl.origin}/api/integrations/salesforce/callback`
        const authUrl = await getSalesforceAuthUrl(session.user.companyId, redirectUri)
        return NextResponse.redirect(authUrl)
    } catch (error) {
        console.error("Salesforce auth error:", error)
        return NextResponse.json(
            { error: "Failed to initiate Salesforce authentication" },
            { status: 500 }
        )
    }
}

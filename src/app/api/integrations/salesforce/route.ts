import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
    const session = await auth()

    if (!session?.user?.companyId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const integration = await prisma.integration.findUnique({
            where: {
                companyId_integrationType: {
                    companyId: session.user.companyId,
                    integrationType: "SALESFORCE",
                },
            },
        })

        if (!integration || integration.status !== "ACTIVE") {
            return NextResponse.json({ connected: false })
        }

        return NextResponse.json({
            connected: true,
            // In a real app, we might fetch some stats from Salesforce here using the stored token
            data: {
                contacts: 0, // Placeholder
                accounts: 0
            }
        })

    } catch (error) {
        console.error("Salesforce status error:", error)
        return NextResponse.json({ error: "Failed to fetch Salesforce status" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const session = await auth()

    if (!session?.user?.companyId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await req.json()

        if (body.action === "disconnect") {
            await prisma.integration.delete({
                where: {
                    companyId_integrationType: {
                        companyId: session.user.companyId,
                        integrationType: "SALESFORCE",
                    },
                },
            })
            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    } catch (error) {
        console.error("Salesforce disconnect error:", error)
        return NextResponse.json({ error: "Failed to disconnect Salesforce" }, { status: 500 })
    }
}

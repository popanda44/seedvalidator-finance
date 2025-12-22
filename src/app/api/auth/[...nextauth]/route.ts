import { handlers } from "@/lib/auth"

// Required for Prisma adapter - Edge runtime doesn't support database connections
export const runtime = "nodejs"

export const { GET, POST } = handlers

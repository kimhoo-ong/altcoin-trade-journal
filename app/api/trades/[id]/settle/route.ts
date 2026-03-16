import { NextResponse } from "next/server";
import { settleTrade } from "@/lib/trade-service";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as { status?: "won" | "lost" };

    if (body.status !== "won" && body.status !== "lost") {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const trade = await settleTrade(id, body.status);
    return NextResponse.json({ trade });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not settle trade."
      },
      { status: 500 }
    );
  }
}

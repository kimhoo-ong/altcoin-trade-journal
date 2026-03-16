import { NextResponse } from "next/server";
import { createTrade } from "@/lib/trade-service";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const coin = String(formData.get("coin") || "").trim().toUpperCase();
    const setup = String(formData.get("setup") || "");
    const direction = String(formData.get("direction") || "");
    const stopLossType = String(formData.get("stopLossType") || "");
    const takeProfitType = String(formData.get("takeProfitType") || "");
    const customSetup = String(formData.get("customSetup") || "");
    const notes = String(formData.get("notes") || "");
    const screenshotValue = formData.get("screenshot");
    const screenshot = screenshotValue instanceof File ? screenshotValue : null;

    if (!coin || !setup || !direction || !stopLossType || !takeProfitType) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const trade = await createTrade({
      coin,
      setup,
      customSetup,
      direction,
      stopLossType,
      takeProfitType,
      notes,
      screenshot
    });

    return NextResponse.json({ trade }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Could not create trade."
      },
      { status: 500 }
    );
  }
}

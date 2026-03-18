import { NextResponse } from "next/server";
import { createTrade } from "@/lib/trade-service";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const coin = String(formData.get("coin") || "").trim().toUpperCase();
    const modelRecommendation = String(formData.get("modelRecommendation") || "");
    const direction = String(formData.get("direction") || "");
    const stopLossType = String(formData.get("stopLossType") || "");
    const takeProfitType = String(formData.get("takeProfitType") || "");
    const notes = String(formData.get("notes") || "");

    if (!coin || !modelRecommendation || !direction || !stopLossType || !takeProfitType) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const trade = await createTrade({
      coin,
      modelRecommendation,
      direction,
      stopLossType,
      takeProfitType,
      notes
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

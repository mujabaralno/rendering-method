// app/api/quotes/route.ts
import { NextResponse } from "next/server";
import data from "@/data/data-dummy.json";

export async function GET() {
  return NextResponse.json({
    papers: data.papers,
    quoteTemplates: data.quoteTemplates
  });
}

import { NextRequest, NextResponse } from "next/server";

const DEFAULT_SYMBOLS = ["USD", "EUR", "GBP", "JPY"];
const DEFAULT_BASE = "IDR";

export const revalidate = 3600;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const base = (searchParams.get("base") || DEFAULT_BASE).toUpperCase();
  const symbolsParam = searchParams.get("symbols");
  const symbols = symbolsParam
    ? symbolsParam.toUpperCase()
    : DEFAULT_SYMBOLS.join(",");

  const url = new URL("https://api.frankfurter.dev/v1/latest");
  url.searchParams.set("base", base);
  url.searchParams.set("symbols", symbols);

  const response = await fetch(url.toString(), {
    next: { revalidate },
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch exchange rates." },
      { status: 502 }
    );
  }

  const data = await response.json();
  return NextResponse.json(data, { status: 200 });
}

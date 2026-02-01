import { NextResponse } from "next/server";

/**
 * Sprawdza token admina z header x-admin-token
 * Rzuca Response z 401 jeśli token jest niepoprawny lub brak
 */
export function assertAdmin(req: Request): void {
  const token = req.headers.get("x-admin-token");
  const expectedToken = process.env.ADMIN_TOKEN;

  console.log("--- ADMIN AUTH DEBUG ---");
  console.log("Token received:", token ? "YES" : "NO");
  console.log("Expected token exists:", expectedToken ? "YES" : "NO");
  console.log("Tokens match:", token === expectedToken);

  if (!expectedToken) {
    console.error("ADMIN_TOKEN not set in environment variables");
    throw NextResponse.json(
      { error: "Unauthorized - Admin token not configured" },
      { status: 401 }
    );
  }

  if (!token || token !== expectedToken) {
    console.error("Invalid or missing admin token");
    throw NextResponse.json(
      { error: "Unauthorized - Invalid token" },
      { status: 401 }
    );
  }

  console.log("Admin authentication successful");
}


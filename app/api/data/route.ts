import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

const SAMPLE_DATA = [{"naics_code":"2361","industry":"Residential Building","state":"TX","claim_frequency_per_100":8.4,"loss_ratio":0.68,"avg_claim_cost":48200,"fatality_rate":0.012,"ncci_class_code":"5651","benchmark_premium":12.40,"actual_vs_benchmark":1.08,"trend_3yr":"increasing"},{"naics_code":"4841","industry":"General Freight Trucking","state":"CA","claim_frequency_per_100":12.8,"loss_ratio":0.74,"avg_claim_cost":62400,"fatality_rate":0.028,"ncci_class_code":"7230","benchmark_premium":18.60,"actual_vs_benchmark":0.94,"trend_3yr":"stable"},{"naics_code":"7221","industry":"Full-Service Restaurants","state":"FL","claim_frequency_per_100":6.2,"loss_ratio":0.58,"avg_claim_cost":28100,"fatality_rate":0.002,"ncci_class_code":"9082","benchmark_premium":7.20,"actual_vs_benchmark":1.02,"trend_3yr":"decreasing"}];

function getStats(data: Record<string, unknown>[]) {
  if (!data || data.length === 0) return {};
  const numericKeys = Object.keys(data[0]).filter(k => typeof data[0][k] === "number");
  const stats: Record<string, unknown> = { total_records: data.length };
  numericKeys.slice(0, 2).forEach(k => {
    const avg = data.reduce((s, r) => s + (Number(r[k]) || 0), 0) / data.length;
    stats[`avg_${k}`] = Math.round(avg * 100) / 100;
  });
  return stats;
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  
  let data = SAMPLE_DATA as Record<string, unknown>[];
  if (q) {
    data = data.filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(q.toLowerCase()))
    );
  }
  
  return NextResponse.json({
    data,
    stats: getStats(data),
    refreshed: new Date().toISOString()
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const data = SAMPLE_DATA as Record<string, unknown>[];
  const headers = data.length > 0 ? Object.keys(data[0]) : [];
  const csv = [
    headers.join(","),
    ...data.map(r => headers.map(h => String(r[h] ?? "")).join(","))
  ].join("\n");
  
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename=claimbench-export.csv`
    }
  });
}

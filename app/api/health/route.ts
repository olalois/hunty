import { NextResponse } from "next/server"
import { MONITORING } from "@/lib/monitoring/config"
import { getAggregatedMetrics, getErrorRate, getP95ResponseTime } from "@/lib/monitoring/apiMonitor"
import type { HealthCheckResult, DependencyStatus, HealthStatus } from "@/lib/monitoring/types"

const startTime = Date.now()

async function checkDependency(name: string, url: string, timeoutMs: number): Promise<DependencyStatus> {
  const start = Date.now()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), timeoutMs)
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    return {
      name,
      status: response.ok ? "healthy" : "degraded",
      latencyMs: Date.now() - start,
      error: response.ok ? undefined : `HTTP ${response.status}`,
    }
  } catch (error) {
    return {
      name,
      status: "unhealthy",
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

export async function GET() {
  const errorRate = getErrorRate()
  const p95ResponseTime = getP95ResponseTime()
  const metrics = getAggregatedMetrics()

  const checks: Promise<DependencyStatus>[] = []
  if (process.env.NEXT_PUBLIC_SOROBAN_RPC_URL) {
    checks.push(
      checkDependency("soroban-rpc", process.env.NEXT_PUBLIC_SOROBAN_RPC_URL, MONITORING.health.timeoutMs),
    )
  }

  const dependencies = await Promise.all(checks)

  const hasUnhealthy = dependencies.some((d) => d.status === "unhealthy")
  const hasDegraded = dependencies.some((d) => d.status === "degraded")
  const isErrorRateHigh = errorRate > MONITORING.alerts.errorRateThreshold
  const isResponseTimeHigh = p95ResponseTime > MONITORING.alerts.p95ResponseTimeMs

  let status: HealthStatus = "healthy"
  if (hasUnhealthy || isErrorRateHigh) status = "unhealthy"
  else if (hasDegraded || isResponseTimeHigh) status = "degraded"

  const result: HealthCheckResult = {
    status,
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - startTime) / 1000),
    version: process.env.NEXT_PUBLIC_APP_VERSION || "0.1.0",
    dependencies,
  }

  const statusCode = status === "unhealthy" ? 503 : status === "degraded" ? 200 : 200

  return NextResponse.json(
    {
      ...result,
      errorRate,
      p95ResponseTimeMs: p95ResponseTime,
      endpoints: metrics,
    },
    { status: statusCode },
  )
}

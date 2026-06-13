"use client";

import { useHealth } from "@/api/generated/health/health";

export default function HealthStatus() {
  const { data, error, isLoading } = useHealth();

  if (isLoading) return <span className="text-zinc-400">Checking server...</span>;
  if (error) return <span className="text-red-500">Server unreachable</span>;

  return (
    <span className="text-green-600 dark:text-green-400">
      Server OK — {JSON.stringify(data?.data)}
    </span>
  );
}

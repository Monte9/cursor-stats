"use client";

import { useRouter } from "next/navigation";
import { DEMO_DATA } from "@/lib/demo-data";
import { Dashboard } from "@/components/app/dashboard";

export default function DemoPage() {
  const router = useRouter();

  return (
    <Dashboard
      data={DEMO_DATA}
      warnings={[]}
      skippedRows={0}
      isDemo={true}
      onReset={() => router.push("/app")}
    />
  );
}

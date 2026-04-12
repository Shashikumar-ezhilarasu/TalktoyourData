import React from "react";
import DashboardClient from "@/components/dashboard/DashboardClient";

export default function DashboardPage({
  params,
}: {
  params: { datasetId: string };
}) {
  return <DashboardClient datasetId={params.datasetId} />;
}

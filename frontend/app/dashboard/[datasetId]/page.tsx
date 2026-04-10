import React from 'react';
import DashboardClient from '@/components/dashboard/DashboardClient';
import { api } from '@/lib/api';

export default async function DashboardPage({ params }: { params: { datasetId: string } }) {
  // SSR initial fetch
  const initialDataset = await api.datasets.get(params.datasetId);

  return (
    <DashboardClient 
      datasetId={params.datasetId} 
      initialDataset={initialDataset} 
    />
  );
}

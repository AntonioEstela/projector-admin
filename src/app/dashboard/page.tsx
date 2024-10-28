'use client';

import { useState, useEffect } from 'react';
import { columns, DashboardColumn } from './columns';
import { DataTable } from './data-table';
import { getBaseURL } from '@/lib/utils';

async function fetchDashboardData() {
  const projectors = await fetch(`${getBaseURL()}/api/projectors`).then((res) => res.json());

  return projectors;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardColumn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      const fetchedData = await fetchDashboardData();
      setData(fetchedData);
      setLoading(false);
    }

    getData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <DataTable data={data} columns={columns} />;
}

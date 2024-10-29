'use client';

import { useState, useEffect } from 'react';
import { columns, DashboardColumn } from './columns';
import { DataTable } from './data-table';
import { getBaseURL } from '@/lib/utils';
import { AvatarDropdown } from '@/components/ui/avatar-dropdown';
import { Separator } from '@/components/ui/separator';
import { LayoutDashboard } from 'lucide-react';

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

  return (
    <div>
      <nav className='flex justify-between items-center py-5 px-10'>
        <div className='flex flex-row items-center'>
          <LayoutDashboard size={24} strokeWidth={2.5} className='mr-2' />
          <span className='font-bold text-xl'>Dashboard</span>
          <Separator orientation='vertical' className='mx-4 h-5' />
          <span className='text-sm'>Proyectores</span>
        </div>
        <AvatarDropdown />
      </nav>
      <DataTable data={data} columns={columns} />;
    </div>
  );
}

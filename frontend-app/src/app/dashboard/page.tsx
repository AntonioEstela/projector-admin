'use client';

import { useState, useEffect } from 'react';
import { columns, DashboardColumn } from './columns';
import { DataTable } from './data-table';
import { getBaseURL } from '@/lib/utils';
import { AvatarDropdown } from '@/components/ui/avatar-dropdown';
import { Separator } from '@/components/ui/separator';
import { LayoutDashboard } from 'lucide-react';
import LoadingSkeleton from '@/components/ui/loading-skeleton';

async function fetchDashboardData(
  setData: React.Dispatch<React.SetStateAction<any[]>>,
  setIsRefreshing: React.Dispatch<React.SetStateAction<boolean>> = () => {}
) {
  setIsRefreshing(true);
  const projectors = await fetch(`${getBaseURL()}/api/projectors`).then((res) => res.json());
  setData(projectors);
  setIsRefreshing(false);
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardColumn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial data fetch
    async function getData() {
      await fetchDashboardData(setData);
      setLoading(false);
    }

    getData();

    // Set up interval for periodic updates
    const interval = setInterval(() => {
      console.log('Refreshing data...');
      fetchDashboardData(setData);
    }, 30000); // 1-minute interval (30000ms)

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
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
      <DataTable data={data} columns={columns} handleRefreshDashboard={() => fetchDashboardData(setData, setLoading)} />
    </div>
  );
}

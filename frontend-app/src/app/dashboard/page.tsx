'use client';

import { useState, useEffect } from 'react';
import { columns, DashboardColumn } from './columns';
import { DataTable } from './data-table';
import { AvatarDropdown } from '@/components/ui/avatar-dropdown';
import { Separator } from '@/components/ui/separator';
import { LayoutDashboard } from 'lucide-react';
import LoadingSkeleton from '@/components/ui/loading-skeleton';
import { isTokenExpired } from '@/lib/jwt';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

async function fetchDashboardData(
  setData: React.Dispatch<React.SetStateAction<any[]>>,
  setIsRefreshing: React.Dispatch<React.SetStateAction<boolean>> = () => {}
) {
  setIsRefreshing(true);
  const projectors = await fetch(`/api/projectors`).then((res) => res.json());
  setData(projectors);
  setIsRefreshing(false);
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token || isTokenExpired(token)) {
      // If no token or token is expired, redirect to login page
      router.push('/');
    }
    if (token && !isTokenExpired(token)) setIsAuthenticated(true);
  }, [router]);

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
    isAuthenticated && (
      <div>
        <nav className='relative'>
          <Image src='/dashboard-banner.png' alt='Login' layout='fill' className='absolute inset-0 z-0 object-cover' />
          <div className='flex justify-between items-center py-5 px-10 max-lg:justify-end'>
            <div className='relative z-10 flex flex-row items-center max-lg:hidden lg:flex'>
              <LayoutDashboard size={24} strokeWidth={2.5} className='mr-2 text-white' />
              <span className='font-bold text-xl text-white'>Dashboard</span>
              <Separator orientation='vertical' className='mx-4 h-5' />
              <span className='text-sm text-white'>Proyectores</span>
            </div>
            <AvatarDropdown />
          </div>
        </nav>
        <DataTable
          data={data}
          columns={columns}
          handleRefreshDashboard={() => fetchDashboardData(setData, setLoading)}
        />
      </div>
    )
  );
}

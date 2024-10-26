import { useState, useEffect } from 'react';
import dbConnect from '@/lib/db';
import { columns, DashboardColumn } from './columns';
import { DataTable } from './data-table';
import Projector from '@/models/Projectors';
import { mapToDashboardColum } from '@/lib/utils';

type DbProjector = {
  _id: string;
  name: string;
  projectorModel: string;
  location: string;
  ipAddress: string;
  status: string;
  lampHours: number;
  tags: string[];
  reference: string;
  groups: string;
};

async function fetchDashboardData() {
  await dbConnect();

  const projectors = await Projector.find();

  return projectors.map((projector: DbProjector) => mapToDashboardColum(projector));
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

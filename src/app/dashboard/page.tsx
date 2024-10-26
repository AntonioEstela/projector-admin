import dbConnect from '@/lib/db';
import { columns } from './columns';
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

export default async function Dashboard() {
  const data = await fetchDashboardData();

  return <DataTable data={data} columns={columns} />;
}

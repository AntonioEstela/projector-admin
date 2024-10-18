import { DashboardColumn, columns } from './columns';
import { DataTable } from './data-table';

async function fetchDashboardData(): Promise<DashboardColumn[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/projectors`);
  return response.json();
}

export default async function Dashboard() {
  const data = await fetchDashboardData();

  return <DataTable data={data} columns={columns} />;
}

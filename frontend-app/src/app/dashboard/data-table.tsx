'use client';

import React, { useEffect, useState } from 'react';
import { DataTablePagination } from '@/components/ui/dataTablePagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCcw, Search } from 'lucide-react';
import { DialogTableCell } from '@/components/ui/dialog-table-cell';
import { useRouter } from 'next/navigation';
import { isTokenExpired } from '@/lib/jwt';
import AddProjectorForm from '@/components/ui/add-projector-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  handleRefreshDashboard: () => void;
}

export const DataTable = <TData, TValue>({ columns, data, handleRefreshDashboard }: DataTableProps<TData, TValue>) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<any>();
  const [search, setSearch] = React.useState<string>('');
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isRowOpen, setIsRowOpen] = useState(false);
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isLoading, setIsLoading] = useState(false);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: { globalFilter, sorting, columnFilters, rowSelection },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    table.setGlobalFilter(search);
  };

  const handleRowClick = (row: any, cell: any) => {
    if (cell.id.includes('ip')) {
      setIsRowOpen(true);
      setSelectedRow(row);
    }
  };

  const downloadCSV = async () => {
    const response = await fetch('/api/reports/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: '2024-11-01',
        endDate: '2024-11-09',
        format: 'csv',
      }),
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'report.csv';
    link.click();
  };

  const downloadPDF = async () => {
    const response = await fetch('/api/reports/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startDate: '2024-11-01',
        endDate: '2024-11-09',
        format: 'pdf',
      }),
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'report.pdf';
    link.click();
  };

  return (
    <div className='p-10'>
      <div className='flex flex-row justify-between'>
        <form onSubmit={handleSearchSubmit} className='flex flex-row w-1/3 mb-10'>
          <Input
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Ingresa algo para buscar...'
            className='mr-5'
          />
          <Button type='submit'>
            <Search className='w-5 h-5' />
          </Button>
        </form>
        <div className='flex flex-row items-center -mt-10'>
          <Button
            variant='outline'
            size='icon'
            onClick={() => {
              setIsLoading(true);
              handleRefreshDashboard();
              setIsLoading(false);
            }}
            disabled={isLoading}
            aria-label='Refresh'
            className='mr-2'
          >
            <RefreshCcw className='h-4 w-4' />
          </Button>
          <div className='mr-2'>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant={'outline'}>Descargar Reportes</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Descargar como</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={downloadPDF}>PDF</DropdownMenuItem>
                <DropdownMenuItem onClick={downloadCSV}>CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <AddProjectorForm rows={table.getRowModel().rows} />
        </div>
      </div>
      <div className='border rounded-md'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      data-state={row.getIsSelected() && 'selected'}
                      onClick={() => handleRowClick(row, cell)}
                      className={cell.id.includes('ip') ? 'cursor-pointer hover:underline' : ''}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className='mt-6'>
        <DataTablePagination table={table} />
      </div>
      {selectedRow && <DialogTableCell selectedRow={selectedRow} setIsRowOpen={setIsRowOpen} isRowOpen={isRowOpen} />}
    </div>
  );
};

'use client';

import React, { useState } from 'react';
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
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Projector, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DialogTableCell } from '@/components/ui/dialog-table-cell';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export const DataTable = <TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<any>();
  const [search, setSearch] = React.useState<String>('');
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isRowOpen, setIsRowOpen] = useState(false);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    state: { globalFilter, sorting, columnFilters },
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

  return (
    <div className='p-10'>
      <form onSubmit={handleSearchSubmit} className='flex flex-row w-1/3 mb-10'>
        <Input onChange={(e) => setSearch(e.target.value)} placeholder='Ingresa algo para buscar...' className='mr-5' />
        <Button type='submit'>
          <Search className='w-5 h-5' />
        </Button>
      </form>
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

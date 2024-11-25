import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function LoadingSkeleton() {
  return (
    <div className='w-full space-y-4'>
      {/* Header */}
      <div className='flex items-center gap-2 p-4 border-b'>
        <div className='flex items-center gap-2'>
          <div className='h-5 w-5 bg-muted rounded animate-pulse' />
          <div className='h-4 w-24 bg-muted rounded animate-pulse' />
        </div>
        <div className='h-4 w-24 bg-muted/50 rounded animate-pulse' />
        <div className='ml-auto h-4 w-8 bg-muted rounded animate-pulse' />
      </div>

      {/* Search and Actions */}
      <div className='flex items-center justify-between px-4 gap-4'>
        <div className='flex-1 max-w-md'>
          <Input disabled className='bg-muted/10' />
        </div>
        <div className='flex items-center gap-2'>
          <Button disabled variant='outline' className='bg-muted/10'>
            <div className='h-4 w-32 bg-muted rounded animate-pulse' />
          </Button>
          <Button disabled className='bg-muted/10'>
            <div className='h-4 w-32 bg-muted rounded animate-pulse' />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className='px-4'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>
                <div className='h-4 w-4 bg-muted rounded animate-pulse' />
              </TableHead>
              <TableHead>
                <div className='h-4 w-8 bg-muted rounded animate-pulse' />
              </TableHead>
              <TableHead>
                <div className='h-4 w-16 bg-muted rounded animate-pulse' />
              </TableHead>
              <TableHead>
                <div className='h-4 w-16 bg-muted rounded animate-pulse' />
              </TableHead>
              <TableHead>
                <div className='h-4 w-24 bg-muted rounded animate-pulse' />
              </TableHead>
              <TableHead>
                <div className='h-4 w-32 bg-muted rounded animate-pulse' />
              </TableHead>
              <TableHead>
                <div className='h-4 w-16 bg-muted rounded animate-pulse' />
              </TableHead>
              <TableHead>
                <div className='h-4 w-24 bg-muted rounded animate-pulse' />
              </TableHead>
              <TableHead>
                <div className='h-4 w-24 bg-muted rounded animate-pulse' />
              </TableHead>
              <TableHead>
                <div className='h-4 w-20 bg-muted rounded animate-pulse' />
              </TableHead>
              <TableHead>
                <div className='h-4 w-16 bg-muted rounded animate-pulse' />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className='h-4 w-4 bg-muted rounded animate-pulse' />
                </TableCell>
                <TableCell>
                  <div className='h-4 w-24 bg-muted rounded animate-pulse' />
                </TableCell>
                <TableCell>
                  <div className='h-4 w-24 bg-muted rounded animate-pulse' />
                </TableCell>
                <TableCell>
                  <div className='h-4 w-16 bg-muted rounded animate-pulse' />
                </TableCell>
                <TableCell>
                  <div className='h-4 w-8 bg-muted rounded animate-pulse' />
                </TableCell>
                <TableCell>
                  <div className='h-4 w-16 bg-muted rounded animate-pulse' />
                </TableCell>
                <TableCell>
                  <div className='h-4 w-20 bg-muted rounded animate-pulse' />
                </TableCell>
                <TableCell>
                  <div className='h-4 w-20 bg-muted rounded animate-pulse' />
                </TableCell>
                <TableCell>
                  <div className='h-4 w-12 bg-muted rounded animate-pulse' />
                </TableCell>
                <TableCell>
                  <div className='h-4 w-24 bg-muted rounded animate-pulse' />
                </TableCell>
                <TableCell>
                  <div className='h-4 w-6 bg-muted rounded animate-pulse' />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between px-4 py-2 border-t'>
        <div className='flex items-center gap-2'>
          <div className='h-4 w-24 bg-muted rounded animate-pulse' />
          <Select disabled>
            <SelectTrigger className='w-16 bg-muted/10'>
              <SelectValue placeholder='10' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='10'>10</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='flex items-center gap-2'>
          <div className='h-4 w-24 bg-muted rounded animate-pulse' />
          <div className='flex items-center gap-1'>
            <Button disabled variant='outline' size='icon' className='w-8 h-8 bg-muted/10'>
              <div className='h-4 w-4 bg-muted rounded animate-pulse' />
            </Button>
            <Button disabled variant='outline' size='icon' className='w-8 h-8 bg-muted/10'>
              <div className='h-4 w-4 bg-muted rounded animate-pulse' />
            </Button>
            <Button disabled variant='outline' size='icon' className='w-8 h-8 bg-muted/10'>
              <div className='h-4 w-4 bg-muted rounded animate-pulse' />
            </Button>
            <Button disabled variant='outline' size='icon' className='w-8 h-8 bg-muted/10'>
              <div className='h-4 w-4 bg-muted rounded animate-pulse' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

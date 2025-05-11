'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Gift,
  Ticket,
} from 'lucide-react';
import { TransactionService } from '@/lib/api/services/transactions';
import { TransactionListParams } from '@/lib/api/schemas/transactions';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function TransactionsMonitor({
  refreshInterval = 10000,
  defaultPageSize = 10,
}: {
  refreshInterval?: number;
  defaultPageSize?: number;
}) {
  const [activeTab, setActiveTab] = useState<'transactions' | 'credits'>(
    'transactions'
  );
  const [queryParams, setQueryParams] = useState<TransactionListParams>({
    page: 1,
    pageSize: defaultPageSize,
    type: activeTab === 'transactions' ? 'all' : 'credit',
  });

  const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
    queryKey: ['transactions', queryParams],
    queryFn: async () => {
      return TransactionService.getTransactions(queryParams);
    },
    refetchInterval: refreshInterval,
  });

  const handlePageChange = (newPage: number) => {
    setQueryParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (key: keyof TransactionListParams, value: any) => {
    setQueryParams((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleTabChange = (tab: 'transactions' | 'credits') => {
    setActiveTab(tab);
    setQueryParams((prev) => ({
      ...prev,
      page: 1,
      type: tab === 'transactions' ? 'all' : 'credit',
    }));
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  const typeIcons = {
    incoming: <ArrowDownLeft className='h-4 w-4 text-green-600' />,
    outgoing: <ArrowUpRight className='h-4 w-4 text-red-600' />,
    credit: <Gift className='h-4 w-4 text-blue-600' />,
    redemption: <Ticket className='h-4 w-4 text-purple-600' />,
  };

  const getAmountClass = (type: string) => {
    switch (type) {
      case 'incoming':
        return 'text-green-600 font-medium';
      case 'outgoing':
        return 'text-red-600 font-medium';
      case 'credit':
        return 'text-blue-600 font-medium';
      case 'redemption':
        return 'text-purple-600 font-medium';
      default:
        return '';
    }
  };

  const getAmountPrefix = (type: string) => {
    switch (type) {
      case 'incoming':
      case 'credit':
        return '+';
      case 'outgoing':
      case 'redemption':
        return '-';
      default:
        return '';
    }
  };

  return (
    <Card className='h-full w-full shadow-sm'>
      <CardHeader className='pb-2'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-xl'>Transaction Monitor</CardTitle>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
            className='h-8 w-8'
          >
            <RefreshCw
              className={cn(
                'h-4 w-4',
                (isFetching || isLoading) && 'animate-spin'
              )}
            />
            <span className='sr-only'>Refresh transactions</span>
          </Button>
        </div>
        <CardDescription>
          Monitor incoming/outgoing eCash transactions and credits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue='transactions'
          value={activeTab}
          onValueChange={(value) =>
            handleTabChange(value as 'transactions' | 'credits')
          }
        >
          <TabsList className='mb-4 grid w-[400px] grid-cols-2'>
            <TabsTrigger value='transactions'>Transactions</TabsTrigger>
            <TabsTrigger value='credits'>Credits</TabsTrigger>
          </TabsList>

          <TabsContent value='transactions' className='space-y-4'>
            <div className='flex flex-wrap gap-4'>
              <div className='w-40'>
                <Select
                  value={
                    queryParams.type === 'credit' ||
                    queryParams.type === 'redemption'
                      ? 'all'
                      : queryParams.type || 'all'
                  }
                  onValueChange={(value) => handleFilterChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Types</SelectItem>
                    <SelectItem value='incoming'>Incoming</SelectItem>
                    <SelectItem value='outgoing'>Outgoing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='w-40'>
                <Select
                  value={queryParams.status || 'all'}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='completed'>Completed</SelectItem>
                    <SelectItem value='failed'>Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {renderTransactionList()}
          </TabsContent>

          <TabsContent value='credits' className='space-y-4'>
            <div className='flex flex-wrap gap-4'>
              <div className='w-40'>
                <Select
                  value={
                    queryParams.type === 'credit' ||
                    queryParams.type === 'redemption'
                      ? queryParams.type || 'credit'
                      : 'credit'
                  }
                  onValueChange={(value) => handleFilterChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Type' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='credit'>Credits</SelectItem>
                    <SelectItem value='redemption'>Redemptions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='w-40'>
                <Select
                  value={queryParams.status || 'all'}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='pending'>Pending</SelectItem>
                    <SelectItem value='completed'>Completed</SelectItem>
                    <SelectItem value='failed'>Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {renderTransactionList()}
          </TabsContent>
        </Tabs>
      </CardContent>
      {data && data.pagination && (
        <CardFooter className='flex items-center justify-between pt-2'>
          <div className='text-muted-foreground text-sm'>
            {data.pagination.total > 0 ? (
              <>
                Showing{' '}
                {(data.pagination.page - 1) * data.pagination.pageSize + 1}-
                {Math.min(
                  data.pagination.page * data.pagination.pageSize,
                  data.pagination.total
                )}{' '}
                of {data.pagination.total}{' '}
                {activeTab === 'credits' ? 'credits' : 'transactions'}
              </>
            ) : (
              `No ${activeTab === 'credits' ? 'credits' : 'transactions'}`
            )}
          </div>
          <div className='flex items-center gap-1'>
            <Button
              variant='outline'
              size='icon'
              disabled={data.pagination.page <= 1}
              onClick={() => handlePageChange(data.pagination.page - 1)}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              disabled={data.pagination.page >= data.pagination.totalPages}
              onClick={() => handlePageChange(data.pagination.page + 1)}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );

  function renderTransactionList() {
    if (isLoading) {
      return (
        <div className='flex items-center justify-center py-8'>
          <Loader2 className='text-primary h-8 w-8 animate-spin' />
        </div>
      );
    }

    if (isError) {
      return (
        <div className='bg-destructive/10 text-destructive flex items-center space-x-2 rounded-md p-4'>
          <AlertCircle className='h-5 w-5' />
          <span>
            Error loading {activeTab === 'credits' ? 'credits' : 'transactions'}
            : {(error as Error).message}
          </span>
        </div>
      );
    }

    if (!data?.data.length) {
      return (
        <div className='text-muted-foreground py-8 text-center'>
          No {activeTab === 'credits' ? 'credits' : 'transactions'} found
          matching your criteria.
        </div>
      );
    }

    return (
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Amount (sats)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    {typeIcons[transaction.type]}
                    <span className='capitalize'>{transaction.type}</span>
                  </div>
                </TableCell>
                <TableCell className={getAmountClass(transaction.type)}>
                  {getAmountPrefix(transaction.type)}
                  {transaction.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant='outline'
                    className={statusColors[transaction.status]}
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {transaction.type === 'credit' && transaction.creditExpiry ? (
                    <div>
                      <div>
                        {new Date(transaction.createdAt).toLocaleString()}
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        Expires:{' '}
                        {new Date(
                          transaction.creditExpiry
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  ) : transaction.type === 'redemption' &&
                    transaction.redemptionDate ? (
                    <div>
                      <div>
                        {new Date(transaction.redemptionDate).toLocaleString()}
                      </div>
                      <div className='text-muted-foreground text-xs'>
                        Created:{' '}
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    new Date(transaction.createdAt).toLocaleString()
                  )}
                </TableCell>
                <TableCell>
                  {transaction.type === 'credit' ? (
                    <div>
                      <div>{transaction.description || 'Credit received'}</div>
                      {transaction.creditId && (
                        <div className='bg-muted mt-1 inline-block rounded px-1.5 py-0.5 font-mono text-xs'>
                          ID: {transaction.creditId}
                        </div>
                      )}
                    </div>
                  ) : transaction.type === 'redemption' ? (
                    <div>
                      <div>{transaction.description || 'Credit redeemed'}</div>
                      {transaction.creditId && (
                        <div className='bg-muted mt-1 inline-block rounded px-1.5 py-0.5 font-mono text-xs'>
                          ID: {transaction.creditId}
                        </div>
                      )}
                    </div>
                  ) : (
                    transaction.description || '-'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
}

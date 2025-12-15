

'use client';
import { useEffect, useState, useMemo } from 'react';
import type { Order, Category } from '@/lib/types';
import { getOrders } from '@/app/actions/order-actions';
import { getSiteContent } from '@/lib/site-content';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Bar, BarChart, Line, LineChart, Pie, PieChart, Cell, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Package, ShoppingCart, Activity, Loader2, Calendar as CalendarIcon, IndianRupee } from 'lucide-react';
import { subDays, format, parseISO, startOfDay, endOfDay, isWithinInterval, isToday } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function DashboardPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeDateRange, setActiveDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  
  const [popoverDateRange, setPopoverDateRange] = useState<DateRange | undefined>(activeDateRange);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [ordersData, siteContent] = await Promise.all([
          getOrders(),
          getSiteContent(),
        ]);
        setAllOrders(ordersData);
        setCategories(siteContent.categories);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);
  
  const filteredOrders = useMemo(() => {
      if (!activeDateRange?.from) return allOrders;
      const from = startOfDay(activeDateRange.from);
      const to = activeDateRange.to ? endOfDay(activeDateRange.to) : endOfDay(from);
      
      return allOrders.filter(order => {
        try {
            const orderDate = parseISO(order.date);
            return isWithinInterval(orderDate, { start: from, end: to });
        } catch (e) {
            console.warn(`Invalid date format for order: ${order.id}`, order.date);
            return false;
        }
      });
  }, [allOrders, activeDateRange]);

  const handleDateApply = () => {
    setActiveDateRange(popoverDateRange);
    setIsPopoverOpen(false);
  };

  const analytics = useMemo(() => {
    const orders = filteredOrders;

    const todaysOrders = allOrders.filter(order => {
        try {
            return isToday(parseISO(order.date));
        } catch (e) {
            return false;
        }
    });

    const todaysRevenue = todaysOrders.reduce((sum, order) => {
        return sum + (order.price ?? 0) * order.quantity;
    }, 0);


    const totalOrders = orders.length;

    const productQuantities = orders.reduce((acc, order) => {
      acc[order.productName] = (acc[order.productName] || 0) + order.quantity;
      return acc;
    }, {} as Record<string, number>);

    const topProduct = totalOrders > 0 ? Object.entries(productQuantities).sort(
      ([, a], [, b]) => b - a
    )[0] : null;

    const productChartData = Object.entries(productQuantities)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a,b) => b.quantity - a.quantity)
      .slice(0, 10);

    const ordersByDay = orders.reduce((acc, order) => {
      const day = format(parseISO(order.date), 'yyyy-MM-dd');
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const daysInRange = activeDateRange?.from ? 
        Array.from({ length: Math.ceil(( (activeDateRange.to || activeDateRange.from).getTime() - activeDateRange.from.getTime()) / (1000 * 3600 * 24)) +1 }, (_, i) => format(subDays(activeDateRange.to || new Date(), i), 'yyyy-MM-dd')).reverse()
        : Array.from({ length: 30 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd')).reverse();

    const lineChartData = daysInRange.map(day => ({
      date: format(parseISO(day), 'MMM dd'),
      orders: ordersByDay[day] || 0,
    }));

    const uniqueOrderDays = Object.keys(ordersByDay).length;
    const averageOrdersPerDay = totalOrders > 0 ? totalOrders / (uniqueOrderDays || 1) : 0;

    const categoryMap = new Map<string, string>();
    categories.forEach(cat => {
        cat.subcategories?.forEach(sub => categoryMap.set(sub.name, cat.name));
        categoryMap.set(cat.name, cat.name);
    });
    
    const categoryCounts = orders.reduce((acc, order) => {
        const categoryName = categoryMap.get(order.productName) || 'Others';
        acc[categoryName] = (acc[categoryName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const categoryOrderDistribution = Object.entries(categoryCounts).map(([name, value]) => ({
        name, value
    }));
    
    const recentOrders = [...orders].slice(0, 10);

    return { totalOrders, todaysRevenue, topProduct, productChartData, lineChartData, averageOrdersPerDay, categoryOrderDistribution, recentOrders };
  }, [filteredOrders, allOrders, categories, activeDateRange]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /><span>&nbsp;Loading dashboard data...</span></div>;
  }

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
            <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
             <div className="flex items-center space-x-2">
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !activeDateRange && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {activeDateRange?.from ? (
                        activeDateRange.to ? (
                            <>
                            {format(activeDateRange.from, "LLL dd, y")} -{" "}
                            {format(activeDateRange.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(activeDateRange.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={popoverDateRange?.from}
                        selected={popoverDateRange}
                        onSelect={setPopoverDateRange}
                        numberOfMonths={2}
                    />
                    <div className="p-4 border-t">
                        <Button onClick={handleDateApply} className="w-full">Apply</Button>
                    </div>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{analytics.todaysRevenue.toFixed(2)}</div>
             <p className="text-xs text-muted-foreground">
              Total value of orders placed today.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Product</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {analytics.topProduct ? analytics.topProduct[0] : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.topProduct ? `${analytics.topProduct[1]} units sold in range` : ''}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders (in range)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalOrders}</div>
             <p className="text-xs text-muted-foreground">
              Total orders in selected date range.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Orders per Day
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageOrdersPerDay.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average daily orders in selected range.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Daily Orders</CardTitle>
            <CardDescription>Order volume for the selected period.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.lineChartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false}/>
                <Tooltip contentStyle={{ background: 'hsl(var(--background))' }} />
                <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-full lg:col-span-3">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Distribution of orders across categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.categoryOrderDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {analytics.categoryOrderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-full">
            <CardHeader>
            <CardTitle>Products vs. Quantities Sold</CardTitle>
            <CardDescription>Top 10 products by quantity in the selected period.</CardDescription>
            </CardHeader>
            <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.productChartData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                <Bar dataKey="quantity" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
            </CardContent>
        </Card>

        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>The last 10 orders received in the selected period.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.recentOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>{order.productName}</TableCell>
                    <TableCell>{order.size || 'N/A'}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>
                      {format(parseISO(order.date), 'MMM dd, yyyy, hh:mm a')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


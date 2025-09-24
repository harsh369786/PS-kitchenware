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
import { Package, ShoppingCart, Activity, Users, Loader2 } from 'lucide-react';
import { subDays, format, parseISO } from 'date-fns';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [ordersData, siteContent] = await Promise.all([
          getOrders(),
          getSiteContent(),
        ]);
        setOrders(ordersData);
        setCategories(siteContent.categories);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const analytics = useMemo(() => {
    if (orders.length === 0) {
      return {
        totalOrders: 0,
        topProduct: null,
        productChartData: [],
        lineChartData: [],
        averageOrdersPerDay: 0,
        categoryOrderDistribution: [],
        recentOrders: [],
      };
    }

    const totalOrders = orders.length;

    const productQuantities = orders.reduce((acc, order) => {
      acc[order.productName] = (acc[order.productName] || 0) + order.quantity;
      return acc;
    }, {} as Record<string, number>);

    const topProduct = Object.entries(productQuantities).sort(
      ([, a], [, b]) => b - a
    )[0];

    const productChartData = Object.entries(productQuantities)
      .map(([name, quantity]) => ({ name, quantity }))
      .slice(0, 10);

    const ordersByDay = orders.reduce((acc, order) => {
      const day = format(parseISO(order.date), 'yyyy-MM-dd');
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const last30Days = Array.from({ length: 30 }, (_, i) =>
      format(subDays(new Date(), i), 'yyyy-MM-dd')
    ).reverse();
    
    const lineChartData = last30Days.map(day => ({
      date: format(parseISO(day), 'MMM dd'),
      orders: ordersByDay[day] || 0,
    }));

    const uniqueOrderDays = Object.keys(ordersByDay).length;
    const averageOrdersPerDay = totalOrders / (uniqueOrderDays || 1);

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
    
    const recentOrders = [...orders].reverse().slice(0, 10);

    return { totalOrders, topProduct, productChartData, lineChartData, averageOrdersPerDay, categoryOrderDistribution, recentOrders };
  }, [orders, categories]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.totalOrders}</div>
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
            {analytics.topProduct ? `${analytics.topProduct[1]} units sold` : ''}
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
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Welcome</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Admin</div>
           <p className="text-xs text-muted-foreground">
            Analytics are updated in real-time.
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-full xl:col-span-2">
        <CardHeader>
          <CardTitle>Products vs. Quantities Sold</CardTitle>
          <CardDescription>Top 10 products by quantity.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.productChartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
              <YAxis />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
              <Bar dataKey="quantity" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-full xl:col-span-2">
        <CardHeader>
          <CardTitle>Daily Orders</CardTitle>
          <CardDescription>Order volume over the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.lineChartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip contentStyle={{ background: 'hsl(var(--background))' }} />
              <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="col-span-full xl:col-span-2">
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
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>The last 10 orders received.</CardDescription>
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
  );
}

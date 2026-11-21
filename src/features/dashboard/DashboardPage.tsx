import { useEffect, useState } from 'react'
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Package, ShoppingCart, TrendingUp, Users } from 'lucide-react'
import { format } from 'date-fns'
import { api } from '@/shared/api/client'
import { Badge, Card, KpiCard, PageHeader, Table } from '@/shared/components/ui'

type SummaryData = {
  kpis: {
    total_revenue: number
    total_orders: number
    new_customers: number
    low_stock_items: number
  }
  revenue_series: { day: string; revenue: number }[]
  sales_by_category: { category: string; amount: number }[]
  top_products: { product_name: string; orders: number; revenue: number }[]
  recent_orders: {
    id: string
    invoice_number: string
    grand_total: number
    invoice_date: string
    status: string
    customer_name: string
  }[]
}

const COLORS = ['#f59e0b', '#111827', '#9ca3af', '#fcd34d', '#fb923c', '#64748b']

export function DashboardPage() {
  const [summary, setSummary] = useState<SummaryData | null>(null)

  useEffect(() => {
    api<{ data: SummaryData }>('/dashboard/summary')
      .then((res) => setSummary(res.data))
      .catch(() =>
        setSummary({
          kpis: {
            total_revenue: 0,
            total_orders: 0,
            new_customers: 0,
            low_stock_items: 0,
          },
          revenue_series: [],
          sales_by_category: [],
          top_products: [],
          recent_orders: [],
        }),
      )
  }, [])

  const formatMoney = (n?: number) =>
    n != null
      ? new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0,
        }).format(n)
      : '—'

  const trend =
    summary?.revenue_series?.map((p) => ({
      date: format(new Date(p.day), 'MMM d'),
      amount: p.revenue,
    })) || []

  const channelData =
    summary?.sales_by_category?.map((c) => ({
      name: c.category,
      value: c.amount,
    })) || []

  return (
    <div>
      <PageHeader
        title="Sales Dashboard"
        description="Track your business performance and growth in real time."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Revenue"
          value={formatMoney(summary?.kpis.total_revenue)}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <KpiCard
          title="Total Orders"
          value={String(summary?.kpis.total_orders ?? 0)}
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <KpiCard
          title="New Customers"
          value={String(summary?.kpis.new_customers ?? 0)}
          icon={<Users className="h-4 w-4" />}
        />
        <KpiCard
          title="Low Stock Items"
          value={String(summary?.kpis.low_stock_items ?? 0)}
          icon={<Package className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <h3 className="font-semibold text-gray-900">Revenue Overview</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend.length ? trend : [{ date: '—', amount: 0 }]}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={50} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#f59e0b"
                  fill="url(#rev)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900">Sales by Category</h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData.length ? channelData : [{ name: 'No sales', value: 1 }]}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                >
                  {(channelData.length ? channelData : [{ name: 'No sales', value: 1 }]).map(
                    (_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ),
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Card padding={false}>
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="font-semibold">Top Selling Products</h3>
          </div>
          <Table
            headers={['Product', 'Orders', 'Revenue']}
            rows={(summary?.top_products || []).map((p) => [
              p.product_name,
              String(p.orders),
              formatMoney(p.revenue),
            ])}
            empty="No sales yet"
          />
        </Card>

        <Card padding={false}>
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="font-semibold">Recent Orders</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {(summary?.recent_orders || []).map((o) => (
              <div key={o.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="font-medium">{o.customer_name}</div>
                  <div className="text-xs text-gray-500">{o.invoice_number}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatMoney(Number(o.grand_total))}</div>
                  <Badge className="mt-1">{o.status}</Badge>
                </div>
              </div>
            ))}
            {!summary?.recent_orders?.length && (
              <p className="px-5 py-8 text-center text-sm text-gray-400">No recent orders</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { api } from '@/shared/api/client'
import { Button, Card, KpiCard, PageHeader, Table } from '@/shared/components/ui'

export function ReportsPage() {
  const [tab, setTab] = useState<'pl' | 'sales' | 'gst' | 'stock'>('pl')
  const [pl, setPl] = useState<any>(null)
  const [sales, setSales] = useState<any>(null)
  const [gst, setGst] = useState<any>(null)
  const [stock, setStock] = useState<any>(null)

  useEffect(() => {
    api<{ data: any }>('/reports/profit-loss').then((r) => setPl(r.data)).catch(() => setPl(null))
    api<{ data: any }>('/reports/sales').then((r) => setSales(r.data)).catch(() => setSales(null))
    api<{ data: any }>('/reports/gst').then((r) => setGst(r.data)).catch(() => setGst(null))
    api<{ data: any }>('/reports/inventory-valuation')
      .then((r) => setStock(r.data))
      .catch(() => setStock(null))
  }, [])

  const money = (n?: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      n || 0,
    )

  return (
    <div>
      <PageHeader title="Reports & Analytics" description="Sales, purchase, GST, valuation and P&L" />
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ['pl', 'Profit & Loss'],
            ['sales', 'Sales'],
            ['gst', 'GST'],
            ['stock', 'Inventory value'],
          ] as const
        ).map(([k, label]) => (
          <Button key={k} size="sm" variant={tab === k ? 'primary' : 'outline'} onClick={() => setTab(k)}>
            {label}
          </Button>
        ))}
      </div>

      {tab === 'pl' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <KpiCard title="Revenue" value={money(pl?.revenue)} />
          <KpiCard title="COGS" value={money(pl?.cogs)} />
          <KpiCard title="Gross profit" value={money(pl?.gross_profit)} />
          <KpiCard title="Expenses" value={money(pl?.expenses)} />
          <KpiCard title="Returns" value={money(pl?.sales_returns)} />
          <KpiCard title="Net profit" value={money(pl?.net_profit)} />
        </div>
      )}

      {tab === 'sales' && (
        <Card>
          <div className="grid gap-4 sm:grid-cols-3">
            <KpiCard title="Invoices" value={String(sales?.summary?.invoices || 0)} />
            <KpiCard title="Revenue" value={money(sales?.summary?.revenue)} />
            <KpiCard title="Tax" value={money(sales?.summary?.tax)} />
          </div>
        </Card>
      )}

      {tab === 'gst' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-4">
            <KpiCard title="Taxable" value={money(gst?.output?.taxable)} />
            <KpiCard title="CGST" value={money(gst?.output?.cgst)} />
            <KpiCard title="SGST" value={money(gst?.output?.sgst)} />
            <KpiCard title="IGST" value={money(gst?.output?.igst)} />
          </div>
          <Table
            headers={['Rate %', 'Tax', 'Taxable sales']}
            rows={(gst?.by_rate || []).map((r: any) => [
              String(r.tax_rate),
              money(r.tax),
              money(r.taxable_sales),
            ])}
            empty="No GST data"
          />
        </div>
      )}

      {tab === 'stock' && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <KpiCard title="Stock value (cost)" value={money(stock?.totals?.stock_value)} />
            <KpiCard title="Retail value" value={money(stock?.totals?.retail_value)} />
          </div>
          <Table
            headers={['Product', 'SKU', 'Qty', 'Cost value', 'Retail value']}
            rows={(stock?.rows || []).slice(0, 50).map((r: any) => [
              r.product_name,
              r.sku,
              String(r.quantity),
              money(r.stock_value),
              money(r.retail_value),
            ])}
            empty="No stock valuation"
          />
        </div>
      )}
    </div>
  )
}

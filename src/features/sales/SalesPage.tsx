import { useEffect, useState } from 'react'
import { api } from '@/shared/api/client'
import { Badge, PageHeader, Table } from '@/shared/components/ui'

type Invoice = {
  id: string
  invoice_number: string
  customer_name?: string
  grand_total: number
  invoice_date: string
  status: string
}

export function SalesPage() {
  const [items, setItems] = useState<Invoice[]>([])

  useEffect(() => {
    api<{ data: Invoice[] }>('/sales/invoices')
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]))
  }, [])

  const money = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)

  return (
    <div>
      <PageHeader title="Sales" description="Invoice history from POS and billing" />
      <Table
        headers={['Invoice', 'Customer', 'Date', 'Amount', 'Status']}
        rows={items.map((i) => [
          i.invoice_number,
          i.customer_name || 'Walk-in',
          new Date(i.invoice_date).toLocaleString(),
          money(Number(i.grand_total)),
          <Badge key={i.id} variant="success">
            {i.status}
          </Badge>,
        ])}
        empty="No sales yet — open POS to create your first bill"
      />
    </div>
  )
}

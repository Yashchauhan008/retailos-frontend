import { useEffect, useState } from 'react'
import { api } from '@/shared/api/client'
import { Card, KpiCard, PageHeader, Table } from '@/shared/components/ui'

export function SuperAdminDashboard() {
  const [totals, setTotals] = useState<Record<string, string>>({})
  const [recent, setRecent] = useState<any[]>([])

  useEffect(() => {
    api<{ data: { totals: Record<string, string>; recent: any[] } }>('/super-admin/dashboard')
      .then((res) => {
        setTotals(res.data.totals || {})
        setRecent(res.data.recent || [])
      })
      .catch(() => undefined)
  }, [])

  return (
    <div>
      <PageHeader title="Platform overview" description="Retailers, trials, and subscriptions" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Tenants" value={totals.tenants || '0'} />
        <KpiCard title="Active" value={totals.active_tenants || '0'} />
        <KpiCard title="Trialing" value={totals.trialing || '0'} />
        <KpiCard title="Suspended" value={totals.suspended || '0'} />
      </div>
      <Card className="mt-6" padding={false}>
        <div className="border-b border-gray-100 px-5 py-4 font-semibold">Recent signups</div>
        <Table
          headers={['Business', 'Industry', 'Plan', 'Status']}
          rows={recent.map((r) => [
            r.name,
            r.industry_name || '—',
            r.plan_name || '—',
            r.status,
          ])}
          empty="No retailers yet"
        />
      </Card>
    </div>
  )
}

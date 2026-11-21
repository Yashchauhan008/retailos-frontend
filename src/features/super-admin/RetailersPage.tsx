import { useEffect, useState } from 'react'
import { api, ApiError } from '@/shared/api/client'
import { Badge, Button, PageHeader, SearchInput, Table } from '@/shared/components/ui'

type Retailer = {
  id: string
  name: string
  email?: string
  status: string
  industry_name?: string
  plan_name?: string
  subscription_status?: string
}

export function RetailersPage() {
  const [items, setItems] = useState<Retailer[]>([])
  const [q, setQ] = useState('')
  const [error, setError] = useState('')

  const load = () => {
    api<{ data: Retailer[] }>(`/super-admin/retailers?q=${encodeURIComponent(q)}`)
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]))
  }

  useEffect(load, [q])

  const toggle = async (id: string, status: string) => {
    setError('')
    try {
      await api(`/super-admin/retailers/${id}`, {
        method: 'PATCH',
        body: { status: status === 'active' ? 'suspended' : 'active' },
      })
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Update failed')
    }
  }

  return (
    <div>
      <PageHeader title="Retailers" description="Search, suspend, and manage tenants" />
      <div className="mb-4 max-w-md">
        <SearchInput value={q} onChange={setQ} placeholder="Search retailers…" />
      </div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <Table
        headers={['Business', 'Industry', 'Plan', 'Status', 'Action']}
        rows={items.map((r) => [
          <div key={`${r.id}-n`}>
            <div className="font-medium">{r.name}</div>
            <div className="text-xs text-gray-500">{r.email}</div>
          </div>,
          r.industry_name || '—',
          r.plan_name || '—',
          <Badge key={`${r.id}-s`} variant={r.status === 'active' ? 'success' : 'warning'}>
            {r.status}
          </Badge>,
          <Button key={`${r.id}-a`} size="sm" variant="outline" onClick={() => toggle(r.id, r.status)}>
            {r.status === 'active' ? 'Suspend' : 'Activate'}
          </Button>,
        ])}
        empty="No retailers found"
      />
    </div>
  )
}

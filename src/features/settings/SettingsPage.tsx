import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, ApiError } from '@/shared/api/client'
import { Button, Card, Input, PageHeader } from '@/shared/components/ui'

export function SettingsPage() {
  const [tenant, setTenant] = useState({
    name: '',
    gstin: '',
    phone: '',
    email: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [settings, setSettings] = useState({ invoice_prefix: 'INV', tax_inclusive: false })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api<{ data: typeof tenant }>('/tenants/me')
      .then((res) =>
        setTenant({
          name: res.data.name || '',
          gstin: (res.data as any).gstin || '',
          phone: (res.data as any).phone || '',
          email: (res.data as any).email || '',
          city: (res.data as any).city || '',
          state: (res.data as any).state || '',
          pincode: (res.data as any).pincode || '',
        }),
      )
      .catch(() => undefined)
    api<{ data: Record<string, unknown> }>('/tenants/settings')
      .then((res) =>
        setSettings({
          invoice_prefix: String(res.data.invoice_prefix ?? 'INV').replace(/"/g, ''),
          tax_inclusive: Boolean(res.data.tax_inclusive),
        }),
      )
      .catch(() => undefined)
  }, [])

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      await api('/tenants/me', { method: 'PATCH', body: tenant })
      await api('/tenants/settings', {
        method: 'PUT',
        body: { settings },
      })
      setMessage('Settings saved')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Save failed')
    }
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Business profile, tax, and invoice preferences"
        actions={
          <Link to="/users">
            <Button variant="outline">Manage users</Button>
          </Link>
        }
      />
      <Card className="max-w-2xl">
        <form onSubmit={save} className="space-y-4">
          <Input
            label="Business name"
            value={tenant.name}
            onChange={(e) => setTenant((t) => ({ ...t, name: e.target.value }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="GSTIN"
              value={tenant.gstin}
              onChange={(e) => setTenant((t) => ({ ...t, gstin: e.target.value }))}
            />
            <Input
              label="Phone"
              value={tenant.phone}
              onChange={(e) => setTenant((t) => ({ ...t, phone: e.target.value }))}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="City"
              value={tenant.city}
              onChange={(e) => setTenant((t) => ({ ...t, city: e.target.value }))}
            />
            <Input
              label="State"
              value={tenant.state}
              onChange={(e) => setTenant((t) => ({ ...t, state: e.target.value }))}
            />
            <Input
              label="PIN"
              value={tenant.pincode}
              onChange={(e) => setTenant((t) => ({ ...t, pincode: e.target.value }))}
            />
          </div>
          <Input
            label="Invoice prefix"
            value={settings.invoice_prefix}
            onChange={(e) => setSettings((s) => ({ ...s, invoice_prefix: e.target.value }))}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.tax_inclusive}
              onChange={(e) => setSettings((s) => ({ ...s, tax_inclusive: e.target.checked }))}
            />
            Prices are tax-inclusive
          </label>
          {message && <p className="text-sm text-emerald-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit">Save settings</Button>
        </form>
      </Card>
    </div>
  )
}

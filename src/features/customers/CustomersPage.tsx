import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { api, ApiError } from '@/shared/api/client'
import { Button, Input, Modal, PageHeader, Table } from '@/shared/components/ui'

type Customer = {
  id: string
  name: string
  phone?: string
  email?: string
  outstanding?: number
}

export function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    api<{ data: Customer[] }>('/customers')
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]))
  }

  useEffect(load, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api('/customers', { method: 'POST', body: form })
      setForm({ name: '', phone: '', email: '' })
      setOpen(false)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create customer')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Customer profiles and outstanding balances"
        actions={
          <Button onClick={() => { setError(''); setOpen(true) }}>
            <Plus className="h-4 w-4" />
            Add customer
          </Button>
        }
      />
      <Table
        headers={['Name', 'Phone', 'Email', 'Outstanding']}
        rows={items.map((c) => [
          c.name,
          c.phone || '—',
          c.email || '—',
          `₹${Number(c.outstanding || 0).toLocaleString('en-IN')}`,
        ])}
        empty="No customers yet"
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Add customer">
        <form onSubmit={submit} className="space-y-3">
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
          <Input
            label="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

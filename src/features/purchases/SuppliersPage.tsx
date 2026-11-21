import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { api, ApiError } from '@/shared/api/client'
import { Button, Input, Modal, PageHeader, Table } from '@/shared/components/ui'

type Supplier = { id: string; name: string; phone?: string; email?: string; gstin?: string }

export function SuppliersPage() {
  const [items, setItems] = useState<Supplier[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', email: '', gstin: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    api<{ data: Supplier[] }>('/purchasing/suppliers')
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]))
  }

  useEffect(load, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api('/purchasing/suppliers', { method: 'POST', body: form })
      setForm({ name: '', phone: '', email: '', gstin: '' })
      setOpen(false)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Suppliers"
        description="Vendor directory for purchasing"
        actions={
          <Button onClick={() => { setError(''); setOpen(true) }}>
            <Plus className="h-4 w-4" />
            Add supplier
          </Button>
        }
      />
      <Table
        headers={['Name', 'Phone', 'Email', 'GSTIN']}
        rows={items.map((s) => [s.name, s.phone || '—', s.email || '—', s.gstin || '—'])}
        empty="No suppliers yet"
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Add supplier">
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
          <Input
            label="GSTIN"
            value={form.gstin}
            onChange={(e) => setForm((f) => ({ ...f, gstin: e.target.value }))}
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

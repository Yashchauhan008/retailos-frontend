import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { api, ApiError } from '@/shared/api/client'
import { Badge, Button, Input, Modal, PageHeader, Select, Table } from '@/shared/components/ui'

export function BranchesPage() {
  const [branches, setBranches] = useState<any[]>([])
  const [transfers, setTransfers] = useState<any[]>([])
  const [branchOpen, setBranchOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const [name, setName] = useState('')
  const [form, setForm] = useState({
    from_branch_id: '',
    to_branch_id: '',
    variant_id: '',
    quantity: '1',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    api<{ data: any[] }>('/tenants/branches')
      .then((r) => {
        setBranches(r.data || [])
        if (r.data?.[0]) {
          setForm((f) => ({
            ...f,
            from_branch_id: r.data![0]!.id,
            to_branch_id: r.data![1]?.id || r.data![0]!.id,
          }))
        }
      })
      .catch(() => setBranches([]))
    api<{ data: any[] }>('/advanced/transfers')
      .then((r) => setTransfers(r.data || []))
      .catch(() => setTransfers([]))
  }

  useEffect(load, [])

  const addBranch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api('/tenants/branches', { method: 'POST', body: { name } })
      setName('')
      setBranchOpen(false)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create branch')
    } finally {
      setSaving(false)
    }
  }

  const createTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const created = await api<{ data: { id: string } }>('/advanced/transfers', {
        method: 'POST',
        body: {
          from_branch_id: form.from_branch_id,
          to_branch_id: form.to_branch_id,
          items: [{ variant_id: form.variant_id, quantity: Number(form.quantity) }],
        },
      })
      await api(`/advanced/transfers/${created.data.id}/dispatch`, { method: 'POST' })
      await api(`/advanced/transfers/${created.data.id}/receive`, { method: 'POST' })
      setForm((f) => ({ ...f, variant_id: '', quantity: '1' }))
      setTransferOpen(false)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Transfer failed (needs Growth/Pro)')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Branches"
        description="Multi-branch setup and stock transfers"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => { setError(''); setBranchOpen(true) }}>
              <Plus className="h-4 w-4" />
              Add branch
            </Button>
            <Button onClick={() => { setError(''); setTransferOpen(true) }}>
              <Plus className="h-4 w-4" />
              Stock transfer
            </Button>
          </div>
        }
      />
      {error && !branchOpen && !transferOpen && (
        <p className="mb-3 text-sm text-red-600">{error}</p>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <Table
          headers={['Name', 'Code', 'Default', 'Status']}
          rows={branches.map((b) => [
            b.name,
            b.code || '—',
            b.is_default ? 'Yes' : '—',
            <Badge key={b.id} variant={b.is_active ? 'success' : 'default'}>
              {b.is_active ? 'Active' : 'Off'}
            </Badge>,
          ])}
          empty="No branches"
        />
        <Table
          headers={['Transfer #', 'Status']}
          rows={transfers.map((t) => [t.transfer_number, t.status])}
          empty="No transfers"
        />
      </div>

      <Modal open={branchOpen} onClose={() => setBranchOpen(false)} title="Add branch">
        <form onSubmit={addBranch} className="space-y-3">
          <Input
            label="Branch name"
            placeholder="New branch name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setBranchOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        title="Stock transfer"
        description="Move inventory between branches"
      >
        <form onSubmit={createTransfer} className="space-y-3">
          <Select
            label="From"
            value={form.from_branch_id}
            onChange={(e) => setForm((f) => ({ ...f, from_branch_id: e.target.value }))}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
          <Select
            label="To"
            value={form.to_branch_id}
            onChange={(e) => setForm((f) => ({ ...f, to_branch_id: e.target.value }))}
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Select>
          <Input
            label="Variant ID"
            required
            value={form.variant_id}
            onChange={(e) => setForm((f) => ({ ...f, variant_id: e.target.value }))}
          />
          <Input
            label="Qty"
            type="number"
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setTransferOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Transferring…' : 'Transfer now'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

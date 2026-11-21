import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { api, ApiError } from '@/shared/api/client'
import { Badge, Button, Input, Modal, PageHeader, Select, Table } from '@/shared/components/ui'

export function ReturnsPage() {
  const [items, setItems] = useState<any[]>([])
  const [branchId, setBranchId] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    variant_id: '',
    product_name: '',
    quantity: '1',
    unit_price: '',
    reason: '',
    refund_method: 'cash',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    api<{ data: any[] }>('/sales/returns').then((r) => setItems(r.data || [])).catch(() => setItems([]))
  }

  useEffect(() => {
    load()
    api<{ data: Array<{ id: string; is_default?: boolean }> }>('/tenants/branches')
      .then((res) => {
        const def = res.data?.find((b) => b.is_default) || res.data?.[0]
        if (def) setBranchId(def.id)
      })
      .catch(() => undefined)
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api('/sales/returns', {
        method: 'POST',
        body: {
          branch_id: branchId,
          reason: form.reason,
          refund_method: form.refund_method,
          items: [
            {
              variant_id: form.variant_id,
              product_name: form.product_name || 'Returned item',
              quantity: Number(form.quantity),
              unit_price: Number(form.unit_price),
              restock: true,
            },
          ],
        },
      })
      setForm({
        variant_id: '',
        product_name: '',
        quantity: '1',
        unit_price: '',
        reason: '',
        refund_method: 'cash',
      })
      setOpen(false)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Return failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Sales returns"
        description="Refunds and exchanges with stock restock"
        actions={
          <Button onClick={() => { setError(''); setOpen(true) }}>
            <Plus className="h-4 w-4" />
            Process return
          </Button>
        }
      />
      <Table
        headers={['Return #', 'Type', 'Amount', 'Method', 'Date']}
        rows={items.map((r) => [
          r.return_number,
          <Badge key={r.id}>{r.return_type}</Badge>,
          `₹${Number(r.grand_total).toLocaleString('en-IN')}`,
          r.refund_method,
          new Date(r.return_date).toLocaleString(),
        ])}
        empty="No returns yet"
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Process return"
        description="Refund or exchange and restock inventory"
      >
        <form onSubmit={submit} className="space-y-3">
          <Input
            label="Variant ID"
            required
            value={form.variant_id}
            onChange={(e) => setForm((f) => ({ ...f, variant_id: e.target.value }))}
          />
          <Input
            label="Product name"
            value={form.product_name}
            onChange={(e) => setForm((f) => ({ ...f, product_name: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Qty"
              type="number"
              value={form.quantity}
              onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
            />
            <Input
              label="Unit price"
              type="number"
              required
              value={form.unit_price}
              onChange={(e) => setForm((f) => ({ ...f, unit_price: e.target.value }))}
            />
          </div>
          <Select
            label="Refund method"
            value={form.refund_method}
            onChange={(e) => setForm((f) => ({ ...f, refund_method: e.target.value }))}
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="credit_note">Credit note</option>
          </Select>
          <Input
            label="Reason"
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!branchId || saving}>
              {saving ? 'Saving…' : 'Create return'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

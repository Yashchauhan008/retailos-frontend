import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { api, ApiError } from '@/shared/api/client'
import { Badge, Button, Input, Modal, PageHeader, Select, Table } from '@/shared/components/ui'

type Supplier = { id: string; name: string }
type PO = {
  id: string
  po_number: string
  supplier_name: string
  status: string
  grand_total: number
}

export function PurchasesPage() {
  const [pos, setPos] = useState<PO[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [branchId, setBranchId] = useState('')
  const [open, setOpen] = useState(false)
  const [variantId, setVariantId] = useState('')
  const [supplierId, setSupplierId] = useState('')
  const [qty, setQty] = useState('10')
  const [cost, setCost] = useState('100')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    api<{ data: PO[] }>('/purchasing/purchase-orders')
      .then((res) => setPos(res.data || []))
      .catch(() => setPos([]))
  }

  useEffect(() => {
    load()
    api<{ data: Supplier[] }>('/purchasing/suppliers')
      .then((res) => {
        setSuppliers(res.data || [])
        if (res.data?.[0]) setSupplierId(res.data[0].id)
      })
      .catch(() => undefined)
    api<{ data: Array<{ id: string; is_default?: boolean }> }>('/tenants/branches')
      .then((res) => {
        const def = res.data?.find((b) => b.is_default) || res.data?.[0]
        if (def) setBranchId(def.id)
      })
      .catch(() => undefined)
  }, [])

  const createPO = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const created = await api<{ data: { id: string } }>('/purchasing/purchase-orders', {
        method: 'POST',
        body: {
          branch_id: branchId,
          supplier_id: supplierId,
          items: [
            {
              variant_id: variantId,
              quantity: Number(qty),
              unit_cost: Number(cost),
            },
          ],
        },
      })
      await api(`/purchasing/purchase-orders/${created.data.id}/receive`, {
        method: 'POST',
        body: {
          items: [
            {
              variant_id: variantId,
              quantity: Number(qty),
              unit_cost: Number(cost),
            },
          ],
          create_invoice: true,
        },
      })
      setVariantId('')
      setOpen(false)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create/receive PO')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Purchases"
        description="Purchase orders, GRN receiving, and invoices"
        actions={
          <Button onClick={() => { setError(''); setOpen(true) }}>
            <Plus className="h-4 w-4" />
            New PO
          </Button>
        }
      />
      <Table
        headers={['PO #', 'Supplier', 'Total', 'Status']}
        rows={pos.map((p) => [
          p.po_number,
          p.supplier_name,
          `₹${Number(p.grand_total).toLocaleString('en-IN')}`,
          <Badge key={p.id}>{p.status}</Badge>,
        ])}
        empty="No purchase orders yet"
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Quick PO + receive"
        description="Create a purchase order and receive stock in one step"
      >
        <form onSubmit={createPO} className="space-y-3">
          <Select
            label="Supplier"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
          >
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
          <Input
            label="Variant ID"
            required
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input label="Qty" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
            <Input
              label="Unit cost"
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!branchId || !supplierId || saving}>
              {saving ? 'Saving…' : 'Create & receive'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

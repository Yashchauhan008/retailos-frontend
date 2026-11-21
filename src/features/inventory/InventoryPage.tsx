import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { api, ApiError } from '@/shared/api/client'
import { Badge, Button, Input, Modal, PageHeader, Table } from '@/shared/components/ui'

type StockRow = {
  id: string
  product_name: string
  sku?: string
  quantity: number
  low_stock_threshold?: number
  variant_id: string
  branch_id: string
}

export function InventoryPage() {
  const [stock, setStock] = useState<StockRow[]>([])
  const [branchId, setBranchId] = useState('')
  const [open, setOpen] = useState(false)
  const [adjustVariantId, setAdjustVariantId] = useState('')
  const [adjustQty, setAdjustQty] = useState('')
  const [reason, setReason] = useState('Manual adjustment')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    api<{ data: StockRow[] }>('/inventory/stock')
      .then((d) => setStock(d.data || []))
      .catch(() => setStock([]))
  }

  useEffect(() => {
    api<{ data: Array<{ id: string; is_default?: boolean }> }>('/tenants/branches')
      .then((res) => {
        const def = res.data?.find((b) => b.is_default) || res.data?.[0]
        if (def) setBranchId(def.id)
      })
      .catch(() => undefined)
    load()
  }, [])

  const submitAdjust = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api('/inventory/adjustments', {
        method: 'POST',
        body: {
          branch_id: branchId,
          variant_id: adjustVariantId,
          quantity: Number(adjustQty),
          reason,
          mode: 'delta',
        },
      })
      setAdjustVariantId('')
      setAdjustQty('')
      setOpen(false)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Adjustment failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Stock levels, movements, and adjustments"
        actions={
          <Button onClick={() => { setError(''); setOpen(true) }}>
            <Plus className="h-4 w-4" />
            Adjust stock
          </Button>
        }
      />
      <Table
        headers={['Product', 'SKU', 'Qty', 'Status']}
        rows={stock.map((row) => {
          const low =
            row.low_stock_threshold != null &&
            Number(row.quantity) <= Number(row.low_stock_threshold)
          return [
            row.product_name,
            row.sku ?? '—',
            String(row.quantity),
            <Badge key={row.id} variant={low ? 'warning' : 'success'}>
              {low ? 'Low stock' : 'OK'}
            </Badge>,
          ]
        })}
        empty="No stock records yet — receive a GRN or adjust stock."
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Adjust stock"
        description="Apply a quantity delta to a variant"
      >
        <form onSubmit={submitAdjust} className="space-y-3">
          <Input
            label="Variant ID"
            required
            value={adjustVariantId}
            onChange={(e) => setAdjustVariantId(e.target.value)}
            placeholder="Paste variant UUID"
          />
          <Input
            label="Quantity delta"
            type="number"
            step="0.001"
            required
            value={adjustQty}
            onChange={(e) => setAdjustQty(e.target.value)}
          />
          <Input
            label="Reason"
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!branchId || saving}>
              {saving ? 'Saving…' : 'Apply adjustment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

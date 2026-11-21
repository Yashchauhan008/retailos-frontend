import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { api, ApiError } from '@/shared/api/client'
import { Badge, Button, Input, Modal, PageHeader, Table } from '@/shared/components/ui'

export function AdvancedInventoryPage() {
  const [tab, setTab] = useState<'batches' | 'serials' | 'forecast'>('batches')
  const [batches, setBatches] = useState<any[]>([])
  const [serials, setSerials] = useState<any[]>([])
  const [forecasts, setForecasts] = useState<any[]>([])
  const [branchId, setBranchId] = useState('')
  const [batchOpen, setBatchOpen] = useState(false)
  const [serialOpen, setSerialOpen] = useState(false)
  const [batchForm, setBatchForm] = useState({
    variant_id: '',
    batch_number: '',
    quantity: '10',
    expiry_date: '',
  })
  const [serialForm, setSerialForm] = useState({
    variant_id: '',
    serial_value: '',
    serial_type: 'imei',
    warranty_months: '12',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    api<{ data: any[] }>('/advanced/batches').then((r) => setBatches(r.data || [])).catch(() => setBatches([]))
    api<{ data: any[] }>('/advanced/serials').then((r) => setSerials(r.data || [])).catch(() => setSerials([]))
    api<{ data: any[] }>('/advanced/forecasts')
      .then((r) => setForecasts(r.data || []))
      .catch(() => setForecasts([]))
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

  const saveBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api('/advanced/batches', {
        method: 'POST',
        body: {
          branch_id: branchId,
          variant_id: batchForm.variant_id,
          batch_number: batchForm.batch_number,
          quantity: Number(batchForm.quantity),
          expiry_date: batchForm.expiry_date || null,
        },
      })
      setBatchOpen(false)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Batch save failed')
    } finally {
      setSaving(false)
    }
  }

  const saveSerial = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api('/advanced/serials', {
        method: 'POST',
        body: {
          branch_id: branchId,
          variant_id: serialForm.variant_id,
          serial_value: serialForm.serial_value,
          serial_type: serialForm.serial_type,
          warranty_months: Number(serialForm.warranty_months),
        },
      })
      setSerialOpen(false)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Serial save failed (needs Growth/Pro)')
    } finally {
      setSaving(false)
    }
  }

  const generateForecast = async () => {
    setError('')
    try {
      await api('/advanced/forecasts/generate', { method: 'POST' })
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Forecast failed')
    }
  }

  return (
    <div>
      <PageHeader
        title="Advanced inventory"
        description="Batches, expiry, IMEI/serial tracking and reorder forecasts"
        actions={
          tab === 'batches' ? (
            <Button onClick={() => { setError(''); setBatchOpen(true) }}>
              <Plus className="h-4 w-4" />
              Add batch
            </Button>
          ) : tab === 'serials' ? (
            <Button onClick={() => { setError(''); setSerialOpen(true) }}>
              <Plus className="h-4 w-4" />
              Register serial
            </Button>
          ) : (
            <Button onClick={generateForecast}>Generate forecast</Button>
          )
        }
      />
      <div className="mb-4 flex gap-2">
        {(
          [
            ['batches', 'Batches / Expiry'],
            ['serials', 'Serial / IMEI'],
            ['forecast', 'Forecast'],
          ] as const
        ).map(([k, label]) => (
          <Button key={k} size="sm" variant={tab === k ? 'primary' : 'outline'} onClick={() => setTab(k)}>
            {label}
          </Button>
        ))}
      </div>
      {error && !batchOpen && !serialOpen && (
        <p className="mb-3 text-sm text-red-600">{error}</p>
      )}

      {tab === 'batches' && (
        <Table
          headers={['Product', 'Batch', 'Qty', 'Expiry']}
          rows={batches.map((b) => [
            b.product_name,
            b.batch_number,
            String(b.quantity),
            b.expiry_date || '—',
          ])}
          empty="No batches"
        />
      )}

      {tab === 'serials' && (
        <Table
          headers={['Product', 'Value', 'Type', 'Status', 'Warranty']}
          rows={serials.map((s) => [
            s.product_name,
            s.serial_value,
            s.serial_type,
            <Badge key={s.id}>{s.status}</Badge>,
            s.warranty_expires_at || '—',
          ])}
          empty="No serials"
        />
      )}

      {tab === 'forecast' && (
        <Table
          headers={['Product', 'SKU', 'Avg daily', 'Days cover', 'Suggested reorder']}
          rows={forecasts.map((f) => [
            f.product_name,
            f.sku,
            Number(f.avg_daily_sales).toFixed(2),
            String(f.days_of_cover),
            String(f.suggested_reorder_qty),
          ])}
          empty="No forecasts yet"
        />
      )}

      <Modal open={batchOpen} onClose={() => setBatchOpen(false)} title="Add batch">
        <form onSubmit={saveBatch} className="space-y-3">
          <Input
            label="Variant ID"
            required
            value={batchForm.variant_id}
            onChange={(e) => setBatchForm((f) => ({ ...f, variant_id: e.target.value }))}
          />
          <Input
            label="Batch number"
            required
            value={batchForm.batch_number}
            onChange={(e) => setBatchForm((f) => ({ ...f, batch_number: e.target.value }))}
          />
          <Input
            label="Qty"
            type="number"
            value={batchForm.quantity}
            onChange={(e) => setBatchForm((f) => ({ ...f, quantity: e.target.value }))}
          />
          <Input
            label="Expiry"
            type="date"
            value={batchForm.expiry_date}
            onChange={(e) => setBatchForm((f) => ({ ...f, expiry_date: e.target.value }))}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setBatchOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!branchId || saving}>
              {saving ? 'Saving…' : 'Save batch'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={serialOpen} onClose={() => setSerialOpen(false)} title="Register serial / IMEI">
        <form onSubmit={saveSerial} className="space-y-3">
          <Input
            label="Variant ID"
            required
            value={serialForm.variant_id}
            onChange={(e) => setSerialForm((f) => ({ ...f, variant_id: e.target.value }))}
          />
          <Input
            label="Serial / IMEI"
            required
            value={serialForm.serial_value}
            onChange={(e) => setSerialForm((f) => ({ ...f, serial_value: e.target.value }))}
          />
          <Input
            label="Warranty months"
            type="number"
            value={serialForm.warranty_months}
            onChange={(e) => setSerialForm((f) => ({ ...f, warranty_months: e.target.value }))}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setSerialOpen(false)}>
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

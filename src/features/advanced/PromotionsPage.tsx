import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { api, ApiError } from '@/shared/api/client'
import { Badge, Button, Input, Modal, PageHeader, Select, Table } from '@/shared/components/ui'

export function PromotionsPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [promos, setPromos] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    code: '',
    name: '',
    discount_type: 'percent',
    discount_value: '10',
  })
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    api<{ data: any[] }>('/advanced/coupons').then((r) => setCoupons(r.data || [])).catch(() => setCoupons([]))
    api<{ data: any[] }>('/advanced/promotions').then((r) => setPromos(r.data || [])).catch(() => setPromos([]))
  }

  useEffect(load, [])

  const createCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMsg('')
    setSaving(true)
    try {
      await api('/advanced/coupons', {
        method: 'POST',
        body: {
          code: form.code,
          name: form.name,
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value),
        },
      })
      setForm({ code: '', name: '', discount_type: 'percent', discount_value: '10' })
      setMsg('Coupon created')
      setOpen(false)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed — upgrade plan for loyalty/promotions')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Promotions & Loyalty"
        description="Coupons, promotions and reward campaigns"
        actions={
          <Button onClick={() => { setError(''); setMsg(''); setOpen(true) }}>
            <Plus className="h-4 w-4" />
            Create coupon
          </Button>
        }
      />
      {msg && <p className="mb-3 text-sm text-emerald-600">{msg}</p>}
      <div className="space-y-6">
        <Table
          headers={['Code', 'Name', 'Type', 'Value', 'Status']}
          rows={coupons.map((c) => [
            c.code,
            c.name,
            c.discount_type,
            String(c.discount_value),
            <Badge key={c.id} variant={c.is_active ? 'success' : 'default'}>
              {c.is_active ? 'Active' : 'Off'}
            </Badge>,
          ])}
          empty="No coupons yet"
        />
        <Table
          headers={['Promotion', 'Type', 'Status']}
          rows={promos.map((p) => [
            p.name,
            p.promo_type,
            <Badge key={p.id}>{p.is_active ? 'Active' : 'Off'}</Badge>,
          ])}
          empty="No promotions yet"
        />
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Create coupon">
        <form onSubmit={createCoupon} className="space-y-3">
          <Input
            label="Code"
            required
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          />
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Select
            label="Type"
            value={form.discount_type}
            onChange={(e) => setForm((f) => ({ ...f, discount_type: e.target.value }))}
          >
            <option value="percent">Percent</option>
            <option value="flat">Flat</option>
          </Select>
          <Input
            label="Value"
            type="number"
            required
            value={form.discount_value}
            onChange={(e) => setForm((f) => ({ ...f, discount_value: e.target.value }))}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save coupon'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

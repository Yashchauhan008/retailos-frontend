import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { api, ApiError } from '@/shared/api/client'
import { Badge, Button, Input, Modal, PageHeader, SearchInput, Select, Table } from '@/shared/components/ui'

type Product = {
  id: string
  name: string
  is_active?: boolean
  variants?: Array<{ sku?: string; selling_price?: number }>
}

type Option = { id: string; name: string; short_name?: string }

const emptyForm = {
  name: '',
  sku: '',
  barcode: '',
  price: '',
  cost: '',
  category_id: '',
  brand_id: '',
  unit_id: '',
  tax_rate_id: '',
  description: '',
  size: '',
  color: '',
}

export function ProductsPage() {
  const [items, setItems] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [categories, setCategories] = useState<Option[]>([])
  const [brands, setBrands] = useState<Option[]>([])
  const [units, setUnits] = useState<Option[]>([])
  const [taxRates, setTaxRates] = useState<Option[]>([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadProducts = () => {
    const q = search ? `?q=${encodeURIComponent(search)}` : ''
    api<{ data: Product[] }>(`/catalog/products${q}`)
      .then((res) => setItems(res.data || []))
      .catch(() => setItems([]))
  }

  useEffect(() => {
    loadProducts()
  }, [search])

  useEffect(() => {
    Promise.all([
      api<{ data: Option[] }>('/catalog/categories').catch(() => ({ data: [] })),
      api<{ data: Option[] }>('/catalog/brands').catch(() => ({ data: [] })),
      api<{ data: Option[] }>('/catalog/units').catch(() => ({ data: [] })),
      api<{ data: Option[] }>('/catalog/tax-rates').catch(() => ({ data: [] })),
    ]).then(([c, b, u, t]) => {
      setCategories(c.data || [])
      setBrands(b.data || [])
      setUnits(u.data || [])
      setTaxRates(t.data || [])
      setForm((f) => ({
        ...f,
        unit_id: u.data?.[0]?.id || '',
        tax_rate_id: t.data?.[0]?.id || '',
      }))
    })
  }, [])

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const attrs: Record<string, string> = {}
      if (form.size) attrs.size = form.size
      if (form.color) attrs.color = form.color

      await api('/catalog/products', {
        method: 'POST',
        body: {
          name: form.name,
          description: form.description || null,
          category_id: form.category_id || null,
          brand_id: form.brand_id || null,
          unit_id: form.unit_id || null,
          tax_rate_id: form.tax_rate_id || null,
          product_type: form.size || form.color ? 'variant' : 'simple',
          variants: [
            {
              sku: form.sku || `SKU-${Date.now()}`,
              barcode: form.barcode || null,
              selling_price: Number(form.price),
              cost_price: Number(form.cost || 0),
              attrs,
            },
          ],
        },
      })
      setForm((f) => ({
        ...emptyForm,
        unit_id: f.unit_id,
        tax_rate_id: f.tax_rate_id,
      }))
      setOpen(false)
      loadProducts()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const money = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n)

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage catalog, pricing, and variants"
        actions={
          <Button
            onClick={() => {
              setError('')
              setOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Add product
          </Button>
        }
      />
      <div className="mb-4 max-w-md">
        <SearchInput value={search} onChange={setSearch} placeholder="Search products…" />
      </div>
      <Table
        headers={['Name', 'SKU', 'Price', 'Status']}
        rows={items.map((p) => {
          const v = p.variants?.[0]
          return [
            p.name,
            v?.sku ?? '—',
            money(Number(v?.selling_price || 0)),
            <Badge key={p.id} variant={p.is_active === false ? 'default' : 'success'}>
              {p.is_active === false ? 'inactive' : 'active'}
            </Badge>,
          ]
        })}
        empty="No products yet — add your first item."
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add product"
        description="Create a catalog item with pricing"
        size="lg"
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Name" required value={form.name} onChange={(e) => set('name', e.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="SKU" value={form.sku} onChange={(e) => set('sku', e.target.value)} />
            <Input
              label="Barcode"
              value={form.barcode}
              onChange={(e) => set('barcode', e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Selling price (INR)"
              type="number"
              min={0}
              step="0.01"
              required
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
            />
            <Input
              label="Cost price"
              type="number"
              min={0}
              step="0.01"
              value={form.cost}
              onChange={(e) => set('cost', e.target.value)}
            />
          </div>
          <Select
            label="Category"
            value={form.category_id}
            onChange={(e) => set('category_id', e.target.value)}
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Brand" value={form.brand_id} onChange={(e) => set('brand_id', e.target.value)}>
              <option value="">—</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
            <Select label="Unit" value={form.unit_id} onChange={(e) => set('unit_id', e.target.value)}>
              <option value="">—</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.short_name})
                </option>
              ))}
            </Select>
          </div>
          <Select
            label="Tax rate"
            value={form.tax_rate_id}
            onChange={(e) => set('tax_rate_id', e.target.value)}
          >
            <option value="">—</option>
            {taxRates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Size (clothing/footwear)"
              value={form.size}
              onChange={(e) => set('size', e.target.value)}
            />
            <Input label="Color" value={form.color} onChange={(e) => set('color', e.target.value)} />
          </div>
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving…' : 'Save product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

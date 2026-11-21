import { useCallback, useEffect, useMemo, useState } from 'react'
import { Minus, Plus, Search, Trash2 } from 'lucide-react'
import { api, ApiError } from '@/shared/api/client'
import { Badge, Button, PageHeader, SearchInput } from '@/shared/components/ui'

type CatalogItem = {
  variant_id: string
  product_name: string
  sku?: string
  barcode?: string
  selling_price: number
  stock_qty?: number
  allow_decimal?: boolean
  cgst_rate?: number
  sgst_rate?: number
  igst_rate?: number
}

type CartLine = {
  variant_id: string
  product_name: string
  sku?: string
  unit_price: number
  qty: number
  allow_decimal?: boolean
}

export function PosPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<CatalogItem[]>([])
  const [cart, setCart] = useState<CartLine[]>([])
  const [branchId, setBranchId] = useState('')
  const [paying, setPaying] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api<{ data: Array<{ id: string; is_default?: boolean }> }>('/tenants/branches')
      .then((res) => {
        const def = res.data?.find((b) => b.is_default) || res.data?.[0]
        if (def) setBranchId(def.id)
      })
      .catch(() => undefined)
  }, [])

  const search = useCallback(
    async (q: string) => {
      if (!branchId) return
      try {
        const res = await api<{ data: CatalogItem[] }>(
          `/catalog/search?q=${encodeURIComponent(q)}&branch_id=${branchId}`,
        )
        setResults(res.data || [])
      } catch {
        setResults([])
      }
    },
    [branchId],
  )

  useEffect(() => {
    const t = setTimeout(() => search(query), 200)
    return () => clearTimeout(t)
  }, [query, search])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault()
        document.getElementById('pos-search')?.focus()
      }
      if (e.key === 'F9') {
        e.preventDefault()
        void checkout('cash')
      }
      if (e.key === 'Escape') {
        setCart([])
        setMessage('')
        setError('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const addToCart = (item: CatalogItem) => {
    setCart((prev) => {
      const existing = prev.find((l) => l.variant_id === item.variant_id)
      if (existing) {
        return prev.map((l) =>
          l.variant_id === item.variant_id ? { ...l, qty: l.qty + 1 } : l,
        )
      }
      return [
        ...prev,
        {
          variant_id: item.variant_id,
          product_name: item.product_name,
          sku: item.sku,
          unit_price: Number(item.selling_price),
          qty: 1,
          allow_decimal: item.allow_decimal,
        },
      ]
    })
  }

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.variant_id === id ? { ...l, qty: Number((l.qty + delta).toFixed(3)) } : l))
        .filter((l) => l.qty > 0),
    )
  }

  const subtotal = useMemo(
    () => cart.reduce((s, l) => s + l.unit_price * l.qty, 0),
    [cart],
  )

  const checkout = async (method: 'cash' | 'upi' | 'card') => {
    if (!cart.length || !branchId) return
    setPaying(true)
    setMessage('')
    setError('')
    try {
      const res = await api<{ data: { invoice_number: string; grand_total: number } }>(
        '/sales/pos/checkout',
        {
          method: 'POST',
          body: {
            branch_id: branchId,
            items: cart.map((l) => ({
              variant_id: l.variant_id,
              quantity: l.qty,
              unit_price: l.unit_price,
            })),
            payments: [{ method }],
            settle_full: true,
          },
        },
      )
      setCart([])
      setMessage(
        `Invoice ${res.data.invoice_number} · ₹${Number(res.data.grand_total).toLocaleString('en-IN')}`,
      )
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Checkout failed')
    } finally {
      setPaying(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="POS"
        description="Scan, sell, and checkout — F2 search · F9 pay · Esc clear"
      />
      <div className="mt-6 grid min-h-[calc(100vh-12rem)] grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
      <section className="flex flex-col rounded-2xl bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
          <Badge>F2 Search</Badge>
          <Badge>F9 Pay</Badge>
          <Badge>Esc Clear</Badge>
        </div>
        <SearchInput
          id="pos-search"
          value={query}
          onChange={setQuery}
          placeholder="Scan barcode or search name / SKU"
          icon={<Search className="h-4 w-4" />}
        />
        <div className="mt-4 grid flex-1 grid-cols-1 gap-2 overflow-auto sm:grid-cols-2">
          {results.map((p) => (
            <button
              key={p.variant_id}
              type="button"
              onClick={() => addToCart(p)}
              className="rounded-xl border border-gray-100 p-3 text-left transition hover:border-accent hover:bg-orange-50"
            >
              <div className="font-semibold text-gray-900">{p.product_name}</div>
              <div className="mt-1 text-xs text-gray-500">{p.sku}</div>
              <div className="mt-2 flex items-center justify-between">
                <span className="font-bold text-accent">
                  ₹{Number(p.selling_price).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-gray-400">Stock {p.stock_qty ?? 0}</span>
              </div>
            </button>
          ))}
          {!results.length && (
            <p className="col-span-full py-10 text-center text-sm text-gray-400">
              Search products to add to cart
            </p>
          )}
        </div>
      </section>

      <section className="flex flex-col rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold">Cart</h2>
        <div className="mt-3 flex-1 space-y-2 overflow-auto">
          {cart.map((l) => (
            <div
              key={l.variant_id}
              className="flex items-center gap-2 rounded-xl border border-gray-100 p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{l.product_name}</div>
                <div className="text-xs text-gray-500">
                  ₹{l.unit_price.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="rounded-lg border p-1"
                  onClick={() => updateQty(l.variant_id, l.allow_decimal ? -0.1 : -1)}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-semibold">{l.qty}</span>
                <button
                  type="button"
                  className="rounded-lg border p-1"
                  onClick={() => updateQty(l.variant_id, l.allow_decimal ? 0.1 : 1)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-red-100 p-1 text-red-500"
                  onClick={() => setCart((c) => c.filter((x) => x.variant_id !== l.variant_id))}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
          {!cart.length && (
            <p className="py-10 text-center text-sm text-gray-400">Cart is empty</p>
          )}
        </div>

        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal (pre-tax base at pay)</span>
            <span>₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="mt-2 flex justify-between text-xl font-bold">
            <span>Pay</span>
            <span>₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
          </div>
          {message && <p className="mt-2 text-sm text-emerald-600">{message}</p>}
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <Button disabled={paying || !cart.length} onClick={() => checkout('cash')}>
              Cash
            </Button>
            <Button disabled={paying || !cart.length} onClick={() => checkout('upi')}>
              UPI
            </Button>
            <Button disabled={paying || !cart.length} onClick={() => checkout('card')}>
              Card
            </Button>
          </div>
        </div>
      </section>
      </div>
    </div>
  )
}

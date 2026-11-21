import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { api, ApiError } from '@/shared/api/client'
import { Button, Input, Modal, PageHeader, Select, Table } from '@/shared/components/ui'

type Expense = {
  id: string
  title: string
  amount: number
  expense_date: string
  payment_method: string
  category_name?: string
}

export function FinancePage() {
  const [tab, setTab] = useState<'expenses' | 'cash' | 'bank' | 'ar' | 'ap'>('expenses')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [cash, setCash] = useState<any[]>([])
  const [bank, setBank] = useState<any[]>([])
  const [ar, setAr] = useState<any[]>([])
  const [ap, setAp] = useState<any[]>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category_id: '',
    payment_method: 'cash',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    api<{ data: Expense[] }>('/finance/expenses').then((r) => setExpenses(r.data || [])).catch(() => setExpenses([]))
    api<{ data: any[] }>('/finance/cashbook').then((r) => setCash(r.data || [])).catch(() => setCash([]))
    api<{ data: any[] }>('/finance/bankbook').then((r) => setBank(r.data || [])).catch(() => setBank([]))
    api<{ data: { customers: any[] } }>('/finance/receivables')
      .then((r) => setAr(r.data?.customers || []))
      .catch(() => setAr([]))
    api<{ data: any[] }>('/finance/payables').then((r) => setAp(r.data || [])).catch(() => setAp([]))
    api<{ data: Array<{ id: string; name: string }> }>('/finance/expense-categories')
      .then((r) => {
        setCategories(r.data || [])
        if (r.data?.[0]) setForm((f) => ({ ...f, category_id: r.data![0]!.id }))
      })
      .catch(() => undefined)
  }

  useEffect(load, [])

  const createExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api('/finance/expenses', {
        method: 'POST',
        body: {
          title: form.title,
          amount: Number(form.amount),
          category_id: form.category_id || null,
          payment_method: form.payment_method,
        },
      })
      setForm((f) => ({ ...f, title: '', amount: '' }))
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
        title="Expenses & Finance"
        description="Cashbook, bankbook, AR/AP and expenses"
        actions={
          tab === 'expenses' ? (
            <Button onClick={() => { setError(''); setOpen(true) }}>
              <Plus className="h-4 w-4" />
              Add expense
            </Button>
          ) : undefined
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ['expenses', 'Expenses'],
            ['cash', 'Cashbook'],
            ['bank', 'Bankbook'],
            ['ar', 'Receivables'],
            ['ap', 'Payables'],
          ] as const
        ).map(([k, label]) => (
          <Button
            key={k}
            size="sm"
            variant={tab === k ? 'primary' : 'outline'}
            onClick={() => setTab(k)}
          >
            {label}
          </Button>
        ))}
      </div>

      {tab === 'expenses' && (
        <Table
          headers={['Title', 'Category', 'Date', 'Method', 'Amount']}
          rows={expenses.map((e) => [
            e.title,
            e.category_name || '—',
            e.expense_date,
            e.payment_method,
            `₹${Number(e.amount).toLocaleString('en-IN')}`,
          ])}
          empty="No expenses yet"
        />
      )}

      {tab === 'cash' && (
        <Table
          headers={['Date', 'Direction', 'Amount', 'Balance', 'Description']}
          rows={cash.map((e) => [
            new Date(e.entry_date).toLocaleString(),
            e.direction,
            `₹${Number(e.amount).toLocaleString('en-IN')}`,
            `₹${Number(e.balance_after).toLocaleString('en-IN')}`,
            e.description || '—',
          ])}
          empty="No cash entries"
        />
      )}

      {tab === 'bank' && (
        <Table
          headers={['Date', 'Direction', 'Amount', 'Balance', 'Description']}
          rows={bank.map((e) => [
            new Date(e.entry_date).toLocaleString(),
            e.direction,
            `₹${Number(e.amount).toLocaleString('en-IN')}`,
            `₹${Number(e.balance_after).toLocaleString('en-IN')}`,
            e.description || '—',
          ])}
          empty="No bank entries"
        />
      )}

      {tab === 'ar' && (
        <Table
          headers={['Customer', 'Phone', 'Outstanding', 'Credit limit']}
          rows={ar.map((c) => [
            c.name,
            c.phone || '—',
            `₹${Number(c.outstanding).toLocaleString('en-IN')}`,
            `₹${Number(c.credit_limit).toLocaleString('en-IN')}`,
          ])}
          empty="No receivables"
        />
      )}

      {tab === 'ap' && (
        <Table
          headers={['Invoice', 'Supplier', 'Total', 'Paid', 'Due']}
          rows={ap.map((i) => [
            i.invoice_number,
            i.supplier_name,
            `₹${Number(i.grand_total).toLocaleString('en-IN')}`,
            `₹${Number(i.amount_paid).toLocaleString('en-IN')}`,
            `₹${Number(i.amount_due).toLocaleString('en-IN')}`,
          ])}
          empty="No payables"
        />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add expense">
        <form onSubmit={createExpense} className="space-y-3">
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Input
            label="Amount"
            type="number"
            required
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          />
          <Select
            label="Category"
            value={form.category_id}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Select
            label="Payment method"
            value={form.payment_method}
            onChange={(e) => setForm((f) => ({ ...f, payment_method: e.target.value }))}
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="bank">Bank</option>
          </Select>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save expense'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

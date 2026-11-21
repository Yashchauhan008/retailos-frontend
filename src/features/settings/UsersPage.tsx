import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { api, ApiError } from '@/shared/api/client'
import { Badge, Button, Input, Modal, PageHeader, Select, Table } from '@/shared/components/ui'

type Staff = {
  id: string
  name: string
  email: string
  role_name: string
  status: string
}
type Role = { id: string; name: string; code: string }

export function UsersPage() {
  const [users, setUsers] = useState<Staff[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role_id: '',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    api<{ data: Staff[] }>('/users')
      .then((res) => setUsers(res.data || []))
      .catch(() => setUsers([]))
    api<{ data: Role[] }>('/users/roles')
      .then((res) => {
        setRoles(res.data || [])
        const cashier = res.data?.find((r) => r.code === 'cashier') || res.data?.[0]
        if (cashier) setForm((f) => ({ ...f, role_id: cashier.id }))
      })
      .catch(() => undefined)
  }

  useEffect(load, [])

  const invite = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api('/users', { method: 'POST', body: form })
      setForm((f) => ({ ...f, name: '', email: '', password: '' }))
      setOpen(false)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invite failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Users & roles"
        description="Invite staff and assign permissions"
        actions={
          <Button onClick={() => { setError(''); setOpen(true) }}>
            <Plus className="h-4 w-4" />
            Invite user
          </Button>
        }
      />
      <Table
        headers={['Name', 'Email', 'Role', 'Status']}
        rows={users.map((u) => [
          u.name,
          u.email,
          u.role_name,
          <Badge key={u.id} variant={u.status === 'active' ? 'success' : 'default'}>
            {u.status}
          </Badge>,
        ])}
        empty="No staff yet"
      />

      <Modal open={open} onClose={() => setOpen(false)} title="Invite user">
        <form onSubmit={invite} className="space-y-3">
          <Input
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <Input
            label="Temp password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <Select
            label="Role"
            value={form.role_id}
            onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))}
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Inviting…' : 'Invite'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

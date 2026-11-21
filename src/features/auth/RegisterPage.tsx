import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerRetailer } from '@/shared/api/auth'
import { api, ApiError } from '@/shared/api/client'
import { useAuth } from '@/app/providers'
import { Button, Card, Input } from '@/shared/components/ui'

type Industry = { id: string; name: string; code: string }

export function RegisterPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [industries, setIndustries] = useState<Industry[]>([])
  const [form, setForm] = useState({
    business_name: '',
    name: '',
    email: '',
    phone: '',
    password: '',
    industry_id: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api<{ data: Industry[] }>('/tenants/industries', { skipAuth: true })
      .then((res) => {
        setIndustries(res.data || [])
        if (res.data?.[0]) {
          setForm((f) => ({ ...f, industry_id: res.data[0]!.id }))
        }
      })
      .catch(() => setIndustries([]))
  }, [])

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await registerRetailer({
        email: form.email,
        password: form.password,
        name: form.name,
        business_name: form.business_name,
        industry_id: form.industry_id,
        phone: form.phone || undefined,
      })
      if (res.user) setUser(res.user)
      navigate('/onboarding')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-lg">
      <h1 className="text-2xl font-bold text-gray-900">Start free trial</h1>
      <p className="mt-1 text-sm text-gray-500">Register your retail business</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Input
          label="Business name"
          required
          value={form.business_name}
          onChange={(e) => update('business_name', e.target.value)}
        />
        <Input
          label="Owner name"
          required
          value={form.name}
          onChange={(e) => update('name', e.target.value)}
        />
        <label className="block text-sm font-medium text-gray-700">
          Industry
          <select
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-accent"
            required
            value={form.industry_id}
            onChange={(e) => update('industry_id', e.target.value)}
          >
            <option value="">Select industry</option>
            {industries.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </label>
        <Input
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
        />
        <Input
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={(e) => update('phone', e.target.value)}
        />
        <Input
          label="Password"
          type="password"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => update('password', e.target.value)}
        />
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}
        <Button type="submit" className="w-full" disabled={loading || !form.industry_id}>
          {loading ? 'Creating…' : 'Create account'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  )
}

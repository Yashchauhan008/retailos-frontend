import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { superAdminLogin } from '@/shared/api/auth'
import { ApiError } from '@/shared/api/client'
import { Button, Card, Input } from '@/shared/components/ui'

export function SuperAdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@retailos.com')
  const [password, setPassword] = useState('Admin@123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await superAdminLogin({ email, password })
      navigate('/super-admin')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111] p-6">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold">RetailOS Super Admin</h1>
        <p className="mt-1 text-sm text-gray-500">Platform control plane</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

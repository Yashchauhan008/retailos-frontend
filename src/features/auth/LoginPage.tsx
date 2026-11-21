import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, superAdminLogin } from '@/shared/api/auth'
import { ApiError } from '@/shared/api/client'
import { useAuth } from '@/app/providers'
import { Button, Card, Input } from '@/shared/components/ui'

export function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await login({ email, password })
      if (res.user) setUser(res.user)
      if (res.tenant && !res.tenant.onboarding_completed) {
        navigate('/onboarding')
      } else {
        navigate('/')
      }
    } catch (err) {
      // Super Admin lives in a separate table — fall back so platform
      // credentials work on the main /login screen too.
      if (err instanceof ApiError && err.status === 401) {
        try {
          await superAdminLogin({ email, password })
          navigate('/super-admin')
          return
        } catch {
          /* keep original tenant error */
        }
      }
      setError(
        err instanceof ApiError ? err.message : 'Unable to sign in',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
  <div>
      <Card className="shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">Sign in to your RetailOS account</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          New here?{' '}
          <Link to="/register" className="font-semibold text-accent hover:underline">
            Create account
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-gray-500">
          Platform admin?{' '}
          <Link to="/super-admin/login" className="font-semibold text-accent hover:underline">
            Super Admin login
          </Link>
        </p>
      </Card>
  </div>
  )
}
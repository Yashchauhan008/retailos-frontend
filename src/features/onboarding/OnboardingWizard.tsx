import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '@/shared/api/client'
import { Button, Card, Input } from '@/shared/components/ui'

type Step = 1 | 2 | 3

export function OnboardingWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>(1)
  const [profile, setProfile] = useState({
    gstin: '',
    phone: '',
    city: '',
    state: '',
    pincode: '',
  })
  const [branchName, setBranchName] = useState('Main Branch')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tenantName, setTenantName] = useState('')

  useEffect(() => {
    api<{ data: { name?: string; onboarding_completed?: boolean } }>('/tenants/me')
      .then((res) => {
        setTenantName(res.data?.name || '')
        if (res.data?.onboarding_completed) navigate('/')
      })
      .catch(() => undefined)
  }, [navigate])

  const finish = async () => {
    setLoading(true)
    setError('')
    try {
      await api('/tenants/me', {
        method: 'PATCH',
        body: {
          ...profile,
          onboarding_step: 'branch',
        },
      })
      await api('/tenants/settings', {
        method: 'PUT',
        body: {
          settings: {
            currency: 'INR',
            timezone: 'Asia/Kolkata',
            place_of_supply_state: profile.state || null,
          },
        },
      })
      // Update default branch name if changed
      const branches = await api<{ data: Array<{ id: string; is_default?: boolean }> }>(
        '/tenants/branches',
      )
      const main = branches.data?.find((b) => b.is_default) || branches.data?.[0]
      if (main) {
        await api(`/tenants/branches/${main.id}`, {
          method: 'PATCH',
          body: { name: branchName },
        })
      }
      await api('/tenants/me/complete-onboarding', { method: 'POST' })
      navigate('/')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not complete onboarding')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <Card className="w-full max-w-lg">
        <div className="mb-6 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-accent' : 'bg-gray-200'}`}
            />
          ))}
        </div>

        {step === 1 && (
          <>
            <h1 className="text-xl font-bold">Welcome{tenantName ? `, ${tenantName}` : ''}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Confirm business tax details so invoices stay GST-ready.
            </p>
            <div className="mt-6 space-y-4">
              <Input
                label="GSTIN"
                value={profile.gstin}
                onChange={(e) => setProfile((p) => ({ ...p, gstin: e.target.value }))}
              />
              <Input
                label="Business phone"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <Button className="mt-6 w-full" onClick={() => setStep(2)}>
              Continue
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <h1 className="text-xl font-bold">Business address</h1>
            <p className="mt-1 text-sm text-gray-500">Used for invoices and place of supply.</p>
            <div className="mt-6 space-y-4">
              <Input
                label="City"
                value={profile.city}
                onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
              />
              <Input
                label="State"
                value={profile.state}
                onChange={(e) => setProfile((p) => ({ ...p, state: e.target.value }))}
              />
              <Input
                label="PIN code"
                value={profile.pincode}
                onChange={(e) => setProfile((p) => ({ ...p, pincode: e.target.value }))}
              />
            </div>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="flex-1" onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1 className="text-xl font-bold">First branch</h1>
            <p className="mt-1 text-sm text-gray-500">
              Inventory and POS will use this branch by default.
            </p>
            <div className="mt-6">
              <Input
                label="Branch name"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
              />
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button className="flex-1" disabled={loading} onClick={finish}>
                {loading ? 'Saving…' : 'Go to dashboard'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

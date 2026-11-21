import { useEffect, useState } from 'react'
import { api } from '@/shared/api/client'
import { Badge, Card, PageHeader } from '@/shared/components/ui'

export function SubscriptionPage() {
  const [info, setInfo] = useState<{
    plan_name?: string
    plan_code?: string
    subscription_status?: string
    trial_ends_at?: string
    features?: Array<{ feature_key: string; enabled: boolean }>
    limits?: Array<{ limit_key: string; limit_value: number }>
  }>({})

  useEffect(() => {
    api<{
      data: {
        plan_name?: string
        plan_code?: string
        subscription_status?: string
        trial_ends_at?: string
      }
      entitlements: {
        features: Array<{ feature_key: string; enabled: boolean }>
        limits: Array<{ limit_key: string; limit_value: number }>
      }
    }>('/tenants/me')
      .then((res) =>
        setInfo({
          plan_name: res.data.plan_name,
          plan_code: res.data.plan_code,
          subscription_status: res.data.subscription_status,
          trial_ends_at: res.data.trial_ends_at,
          features: res.entitlements.features,
          limits: res.entitlements.limits,
        }),
      )
      .catch(() => undefined)
  }, [])

  return (
    <div>
      <PageHeader
        title="Subscription & Billing"
        description="Plan entitlements are enforced now; payments come in Phase 5"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">{info.plan_name || '—'}</h3>
            <Badge variant="warning">{info.subscription_status || '—'}</Badge>
          </div>
          <p className="mt-2 text-sm text-gray-500">Code: {info.plan_code || '—'}</p>
          {info.trial_ends_at && (
            <p className="mt-1 text-sm text-gray-500">
              Trial ends {new Date(info.trial_ends_at).toLocaleDateString()}
            </p>
          )}
        </Card>
        <Card>
          <h3 className="font-semibold">Limits</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {(info.limits || []).map((l) => (
              <li key={l.limit_key} className="flex justify-between">
                <span className="text-gray-500">{l.limit_key}</span>
                <span className="font-medium">{l.limit_value}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="font-semibold">Features</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {(info.features || []).map((f) => (
              <div
                key={f.feature_key}
                className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2 text-sm"
              >
                <span>{f.feature_key}</span>
                <Badge variant={f.enabled ? 'success' : 'default'}>
                  {f.enabled ? 'On' : 'Off'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

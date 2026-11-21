import { useEffect, useState } from 'react'
import { api } from '@/shared/api/client'
import { Badge, Card, PageHeader } from '@/shared/components/ui'

type Plan = {
  id: string
  name: string
  code: string
  price_monthly: number
  trial_days: number
  is_active: boolean
  features: Array<{ feature_key: string; enabled: boolean }>
  limits: Array<{ limit_key: string; limit_value: number }>
}

export function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])

  useEffect(() => {
    api<{ data: Plan[] }>('/super-admin/plans')
      .then((res) => setPlans(res.data || []))
      .catch(() => setPlans([]))
  }, [])

  return (
    <div>
      <PageHeader title="Plans" description="Subscription structure (payments in Phase 5)" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((p) => (
          <Card key={p.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold">{p.name}</h3>
                <p className="text-sm text-gray-500">{p.code}</p>
              </div>
              <Badge variant={p.is_active ? 'success' : 'default'}>
                {p.is_active ? 'Active' : 'Off'}
              </Badge>
            </div>
            <p className="mt-4 text-2xl font-bold">
              ₹{Number(p.price_monthly).toLocaleString('en-IN')}
              <span className="text-sm font-medium text-gray-400">/mo</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">Trial {p.trial_days} days</p>
            <ul className="mt-4 space-y-1 text-xs text-gray-600">
              {p.limits?.map((l) => (
                <li key={l.limit_key}>
                  {l.limit_key}: {l.limit_value}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  )
}

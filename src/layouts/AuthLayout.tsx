import { Outlet } from 'react-router-dom'
import { Store } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 flex-col justify-between bg-[#111] p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
            <Store className="h-6 w-6 text-white" strokeWidth={2.2} />
          </div>
          <span className="text-xl font-bold tracking-tight">RetailOS</span>
        </div>
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Run your store.
            <br />
            <span className="text-accent">Grow smarter.</span>
          </h2>
          <p className="mt-4 max-w-md text-gray-400">
            POS, inventory, purchases, and insights — unified for modern
            retailers.
          </p>
        </div>
        <p className="text-sm text-gray-500">© {new Date().getFullYear()} RetailOS</p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center bg-surface p-6 md:p-12">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
            <Store className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold">RetailOS</span>
        </div>
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

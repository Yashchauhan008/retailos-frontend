import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { api, ApiError } from '@/shared/api/client'
import { Badge, Button, Card, Input, Modal, PageHeader, Select, Table } from '@/shared/components/ui'

export function EmployeesPage() {
  const [shifts, setShifts] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [shiftOpen, setShiftOpen] = useState(false)
  const [attOpen, setAttOpen] = useState(false)
  const [shiftForm, setShiftForm] = useState({ name: 'Morning', start_time: '09:00', end_time: '17:00' })
  const [attForm, setAttForm] = useState({ user_id: '', status: 'present' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => {
    api<{ data: any[] }>('/advanced/shifts').then((r) => setShifts(r.data || [])).catch(() => setShifts([]))
    api<{ data: any[] }>('/advanced/attendance')
      .then((r) => setAttendance(r.data || []))
      .catch(() => setAttendance([]))
    api<{ data: any[] }>('/users')
      .then((r) => {
        setUsers(r.data || [])
        if (r.data?.[0]) setAttForm((f) => ({ ...f, user_id: r.data![0]!.user_id || r.data![0]!.id }))
      })
      .catch(() => undefined)
  }

  useEffect(load, [])

  const createShift = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api('/advanced/shifts', { method: 'POST', body: shiftForm })
      setShiftOpen(false)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Shift create failed (Growth/Pro)')
    } finally {
      setSaving(false)
    }
  }

  const markAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await api('/advanced/attendance', {
        method: 'POST',
        body: {
          user_id: attForm.user_id,
          status: attForm.status,
          check_in: new Date().toISOString(),
        },
      })
      setAttOpen(false)
      load()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Attendance failed (Growth/Pro)')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Employees & Staff"
        description="Shifts and attendance tracking"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => { setError(''); setShiftOpen(true) }}>
              <Plus className="h-4 w-4" />
              Add shift
            </Button>
            <Button onClick={() => { setError(''); setAttOpen(true) }}>
              <Plus className="h-4 w-4" />
              Mark attendance
            </Button>
          </div>
        }
      />
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card padding={false}>
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="font-semibold">Shifts</h3>
          </div>
          <Table
            headers={['Name', 'Start', 'End']}
            rows={shifts.map((s) => [s.name, String(s.start_time).slice(0, 5), String(s.end_time).slice(0, 5)])}
            empty="No shifts"
          />
        </Card>

        <Card padding={false}>
          <div className="border-b border-gray-100 px-5 py-4">
            <h3 className="font-semibold">Attendance</h3>
          </div>
          <Table
            headers={['Employee', 'Date', 'Status']}
            rows={attendance.slice(0, 12).map((a) => [
              a.user_name,
              a.attendance_date,
              <Badge key={a.id}>{a.status}</Badge>,
            ])}
            empty="No attendance records"
          />
        </Card>
      </div>

      <Modal open={shiftOpen} onClose={() => setShiftOpen(false)} title="Add shift">
        <form onSubmit={createShift} className="space-y-3">
          <Input
            label="Shift name"
            value={shiftForm.name}
            onChange={(e) => setShiftForm((f) => ({ ...f, name: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Start"
              type="time"
              value={shiftForm.start_time}
              onChange={(e) => setShiftForm((f) => ({ ...f, start_time: e.target.value }))}
            />
            <Input
              label="End"
              type="time"
              value={shiftForm.end_time}
              onChange={(e) => setShiftForm((f) => ({ ...f, end_time: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setShiftOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save shift'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={attOpen} onClose={() => setAttOpen(false)} title="Mark attendance">
        <form onSubmit={markAttendance} className="space-y-3">
          <Select
            label="Employee"
            value={attForm.user_id}
            onChange={(e) => setAttForm((f) => ({ ...f, user_id: e.target.value }))}
          >
            {users.map((u) => (
              <option key={u.id} value={u.user_id || u.id}>
                {u.name}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            value={attForm.status}
            onChange={(e) => setAttForm((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="leave">Leave</option>
            <option value="half_day">Half day</option>
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setAttOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Mark today'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

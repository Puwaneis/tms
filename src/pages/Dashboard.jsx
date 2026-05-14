import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "#components/ui/card"
import { IconList, IconUser, IconCheck, IconClock } from "@tabler/icons-react"
import { useAuth } from "../context/AuthContext"
import { toast } from "sonner"
import { TASK_STATUS } from "../utils/Constant"

// superadmin view
const StatCard = ({ title, value, icon: Icon, color }) => (
  <Card className="rounded-2xl">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className={`rounded-xl p-2 ${color}`}>
        <Icon className="size-5 text-white" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">
        {value === null ? <span className="text-muted-foreground text-xl">—</span> : value}
      </div>
    </CardContent>
  </Card>
)

const STATUS_LABELS = {
  [TASK_STATUS.PENDING]: "Pending",
  [TASK_STATUS.IN_PROGRESS]: "In Progress",
  [TASK_STATUS.COMPLETED]: "Completed",
}

const STATUS_BADGE = {
  [TASK_STATUS.PENDING]: "bg-amber-100 text-amber-800",
  [TASK_STATUS.IN_PROGRESS]: "bg-blue-100 text-blue-800",
  [TASK_STATUS.COMPLETED]: "bg-emerald-100 text-emerald-800",
}

// normal user view
const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
})

const UserTaskList = ({ userId }) => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    const run = async () => {
      setLoading(true)
      try {
        const res = await fetch(`http://localhost:5000/api/tasks/all-by-user-id/${userId}`, {
          headers: getAuthHeaders(),
          cache: "no-store",
        })
        const data = await res.json()
        if (!cancelled) setTasks(Array.isArray(data.data) ? data.data : [])
      } catch {
        if (!cancelled) setTasks([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [userId])

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingId(taskId)
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/update-status/${taskId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success("Status updated")
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        )
      } else {
        toast.error("Failed to update status")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return <p className="text-muted-foreground text-sm py-8 text-center">Loading tasks…</p>
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center text-muted-foreground text-sm">
        No tasks assigned to you yet.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Title</th>
            <th className="px-4 py-3 text-left font-medium">Description</th>
            <th className="px-4 py-3 text-center font-medium">Status</th>
            <th className="px-4 py-3 text-center font-medium">Update Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-t hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3 font-medium">{task.title}</td>
              <td className="px-4 py-3 text-muted-foreground">{task.description}</td>
              <td className="px-4 py-3 text-center">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[task.status] ?? "bg-gray-100 text-gray-800"}`}>
                  {STATUS_LABELS[task.status] ?? task.status}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <select
                  value={task.status}
                  disabled={updatingId === task.id}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="rounded-lg border border-input bg-background px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// superadmin view
const Dashboard = () => {
  const { role, userId } = useAuth()
  const [taskTotal, setTaskTotal] = useState(null)
  const [userTotal, setUserTotal] = useState(null)
  const [pendingCount, setPendingCount] = useState(null)
  const [completedCount, setCompletedCount] = useState(null)
  const [inProgressCount, setInProgressCount] = useState(null)

  useEffect(() => {
    if (role !== 'super_admin') return
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

    fetch('http://localhost:5000/api/tasks/all?page=1&pageSize=10000', { headers, cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        const tasks = Array.isArray(d.data) ? d.data : []
        setTaskTotal(typeof d.total === 'number' ? d.total : tasks.length)
        setPendingCount(tasks.filter(t => t.status === TASK_STATUS.PENDING).length)
        setInProgressCount(tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length)
        setCompletedCount(tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length)
      })
      .catch(() => { })

    fetch('http://localhost:5000/api/user/all?page=1&pageSize=10000', { headers, cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        const users = Array.isArray(d.data) ? d.data : []
        setUserTotal(typeof d.total === 'number' ? d.total : users.length)
      })
      .catch(() => { })
  }, [role])

  if (role === 'super_admin') {
    return (
      <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
        <div>
          <p className="text-muted-foreground text-sm mt-1">Overview of your task management system</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Tasks" value={taskTotal} icon={IconList} color="bg-cyan-950" />
          <StatCard title="Total Users" value={userTotal} icon={IconUser} color="bg-blue-600" />
          <StatCard title="Pending Tasks" value={pendingCount} icon={IconClock} color="bg-amber-500" />
          <StatCard title="In Progress Tasks" value={inProgressCount} icon={IconClock} color="bg-blue-600" />
          <StatCard title="Completed Tasks" value={completedCount} icon={IconCheck} color="bg-emerald-600" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <p className="text-muted-foreground text-sm mt-1">Tasks assigned to you. You can update their status below.</p>
      </div>
      {userId && <UserTaskList userId={userId} />}
    </div>
  )
}

export default Dashboard

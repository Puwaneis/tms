import { useState, useEffect, useRef } from "react"
import DataTable from "#components/shared/Datatable"
import { Button } from "#components/ui/button"
import { IconUserCheck, IconChevronDown, IconCheck, IconLoader, IconSearch, IconListCheck } from "@tabler/icons-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "#components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "#components/ui/popover"
import { Field, FieldLabel, FieldError } from "#components/ui/field"
import { cn } from "#lib/utils"
import { toast } from "sonner"

const FORM_CONTROL_CLASS =
  "flex h-9 w-full items-center justify-between rounded-3xl border border-transparent bg-input/50 px-3 text-sm font-normal transition-[color,box-shadow,background-color] outline-none cursor-pointer focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-50 disabled:cursor-not-allowed"

const STATUS_BADGE = {
  pending: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
}
const STATUS_LABEL = { pending: "Pending", in_progress: "In Progress", completed: "Completed" }

const TaskCombobox = ({ value, onChange }) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState("")
  const cancelRef = useRef(false)

  useEffect(() => {
    if (!open) return
    cancelRef.current = false
    const delay = search ? 300 : 0
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `http://localhost:5000/api/dropdown/task?keyword=${encodeURIComponent(search)}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        )
        const data = await res.json()
        if (!cancelRef.current) setOptions(Array.isArray(data.data) ? data.data : [])
      } catch {
        if (!cancelRef.current) setOptions([])
      } finally {
        if (!cancelRef.current) setLoading(false)
      }
    }, delay)
    return () => { cancelRef.current = true; clearTimeout(timer) }
  }, [open, search])

  const handleSelect = (task) => {
    onChange(task.id)
    setSelectedLabel(task.title)
    setOpen(false)
    setSearch("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(FORM_CONTROL_CLASS, !selectedLabel && !value && "text-muted-foreground")}
        >
          <span className="truncate">{selectedLabel || (value ? `Task #${value}` : "Select task…")}</span>
          <IconChevronDown className="size-4 shrink-0 opacity-50 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-80 rounded-2xl shadow-xl border-border/60 overflow-hidden"
        align="start"
        sideOffset={6}
      >
        <div className="relative border-b bg-muted/40 p-2.5">
          <IconSearch className="size-4 absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            placeholder="Search tasks by title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="h-9 w-full rounded-full bg-white border border-transparent pl-9 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 placeholder:text-muted-foreground"
          />
        </div>

        <div className="max-h-64 overflow-y-auto p-1.5">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
              <IconLoader className="size-4 animate-spin" /> Searching…
            </div>
          ) : options.length === 0 ? (
            <div className="flex flex-col items-center gap-1 py-8 text-sm text-muted-foreground">
              <IconListCheck className="size-8 opacity-30" />
              <p>No tasks found</p>
            </div>
          ) : (
            options.map((task) => {
              const isSelected = task.id === value
              const isAssigned = Boolean(task.user_id)
              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => handleSelect(task)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm cursor-pointer text-left transition-colors",
                    isSelected ? "bg-cyan-50" : "hover:bg-muted"
                  )}
                >
                  <div
                    className={cn(
                      "relative flex size-9 shrink-0 items-center justify-center rounded-full",
                      isSelected ? "bg-cyan-950 text-white" : "bg-muted text-foreground"
                    )}
                  >
                    <IconListCheck className="size-4" />
                    {isAssigned && (
                      <span
                        title={`Assigned to ${task.username || `User #${task.user_id}`}`}
                        className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white"
                      >
                        <IconUserCheck className="size-2.5 text-white" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("truncate font-medium", isSelected && "text-cyan-950")}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                          STATUS_BADGE[task.status] ?? "bg-gray-100 text-gray-700"
                        )}
                      >
                        {STATUS_LABEL[task.status] ?? task.status}
                      </span>
                      {isAssigned && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-medium">
                          <IconUserCheck className="size-2.5" />
                          {task.username || `User #${task.user_id}`}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && <IconCheck className="size-4 shrink-0 text-cyan-950" />}
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/* ─── User page ──────────────────────────────────────────────────── */
const User = () => {
  const [openAssign, setOpenAssign] = useState(false)
  const [targetUser, setTargetUser] = useState(null)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [taskError, setTaskError] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  const apiUrl = "http://localhost:5000/api/user/all"
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }

  const handleOpenAssign = (user) => {
    setTargetUser(user)
    setSelectedTaskId(null)
    setTaskError("")
    setOpenAssign(true)
  }

  const handleAssign = async () => {
    if (!selectedTaskId) {
      setTaskError("Please select a task")
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/assign/${selectedTaskId}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ user_id: targetUser.id }),
      })
      if (res.ok) {
        toast.success(`Task assigned to ${targetUser.name || targetUser.email}`)
        setOpenAssign(false)
        setRefreshKey((k) => k + 1)
      } else {
        const data = await res.json()
        toast.error(data.message || "Failed to assign task")
      }
    } catch {
      toast.error("Network error")
    } finally {
      setSubmitting(false)
    }
  }

  const columns = [
    { id: "name", label: "Name", accessor: "name", align: "left" },
    { id: "email", label: "Email", accessor: "email", align: "left" },
    { id: "role", label: "Role", accessor: "role", align: "center" },
    { id: "completed_task_count", label: "Completed Tasks", accessor: "completed_task_count", align: "center" },
    { id: "in_progress_task_count", label: "In Progress Tasks", accessor: "in_progress_task_count", align: "center" },
    { id: "assigned_task_count", label: "Assigned Tasks", accessor: "assigned_task_count", align: "center" },
    { id: "action", label: "Action", accessor: null, align: "center" },
  ]

  const renderCell = (columnId, row) => {
    if (columnId === "action") {
      return (
        <button
          title="Assign Task"
          onClick={() => handleOpenAssign(row)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-input bg-white px-3 py-1.5 text-xs font-medium hover:bg-cyan-50 hover:border-cyan-300 transition-colors cursor-pointer"
        >
          <IconUserCheck className="size-3.5" />
          Assign Task
        </button>
      )
    }
    return null
  }

  return (
    <>
      <div className="w-full">
        <DataTable key={refreshKey} columns={columns} apiUrl={apiUrl} renderCell={renderCell} />
      </div>

      {/* Assign Task Dialog */}
      <Dialog open={openAssign} onOpenChange={setOpenAssign}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold "><span className="text-cyan-950">Assign Task</span></DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Assign a task to <span className="font-semibold text-foreground">{targetUser?.name || targetUser?.email}</span>
            </DialogDescription>
          </DialogHeader>

          <Field>
            <FieldLabel>Task</FieldLabel>
            <TaskCombobox value={selectedTaskId} onChange={(id) => { setSelectedTaskId(id); setTaskError("") }} />
            {taskError && <FieldError>{taskError}</FieldError>}
          </Field>

          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" className="rounded-xl cursor-pointer" onClick={() => setOpenAssign(false)}>
              Cancel
            </Button>
            <Button
              disabled={submitting}
              onClick={handleAssign}
              className="rounded-xl bg-cyan-950 text-white hover:bg-cyan-900 border-none cursor-pointer"
            >
              <IconUserCheck className="size-4" />
              {submitting ? "Assigning…" : "Assign"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default User

import { useState, useEffect } from "react"
import DataTable from "#components/shared/Datatable"
import UserCombobox from "#components/shared/UserCombobox"
import { Button } from "#components/ui/button"
import { IconEdit, IconTrash, IconPlus, IconChevronDown } from "@tabler/icons-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "#components/ui/dialog"
import { Field, FieldGroup, FieldLabel, FieldError } from "#components/ui/field"
import { Input } from "#components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { TASK_STATUS } from "../utils/Constant"

const addTaskFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
})

const editTaskFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  user_id: z.string().min(1, { message: "Please select a user" }),
  status: z.string().min(1, { message: "Status is required" }),
})

const STATUS_OPTIONS = [
  { value: TASK_STATUS.PENDING, label: "Pending" },
  { value: TASK_STATUS.IN_PROGRESS, label: "In Progress" },
  { value: TASK_STATUS.COMPLETED, label: "Completed" },
]

const Task = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(addTaskFormSchema),
    defaultValues: { title: "", description: "" },
  })

  const editForm = useForm({
    resolver: zodResolver(editTaskFormSchema),
    defaultValues: { title: "", description: "", user_id: "", status: "" },
  })
  const { register: editRegister, handleSubmit: editHandleSubmit, formState: { errors: editErrors }, reset: editReset, control: editControl } = editForm

  const [openAddTask, setOpenAddTask] = useState(false)
  const [openEditTask, setOpenEditTask] = useState(false)
  const [openDeleteTask, setOpenDeleteTask] = useState(false)
  const [editTask, setEditTask] = useState({})
  const [deleteTask, setDeleteTask] = useState({})
  const [searchTrigger, setSearchTrigger] = useState(0)

  const apiUrl = "http://localhost:5000/api/tasks/all"

  useEffect(() => {
    if (openEditTask && editTask.id) {
      editReset({
        title: editTask.title || "",
        description: editTask.description || "",
        user_id: editTask.user_id ? String(editTask.user_id) : "",
        status: editTask.status || "",
      })
    }
  }, [openEditTask, editTask, editReset])

  const authHeaders = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
  }

  const columns = [
    { id: "title", label: "Title", accessor: "title", align: "left" },
    { id: "username", label: "Assigned To", accessor: "username", align: "center" },
    { id: "status", label: "Status", accessor: "status", align: "center" },
    { id: "action", label: "Action", accessor: null, align: "center" },
  ]

  const renderCell = (columnId, row) => {
    if (columnId === "status") {
      const cfg =
        row.status === TASK_STATUS.COMPLETED
          ? { cls: "bg-emerald-100 text-emerald-800", label: "Completed" }
          : row.status === TASK_STATUS.IN_PROGRESS
            ? { cls: "bg-blue-100 text-blue-800", label: "In Progress" }
            : { cls: "bg-amber-100 text-amber-800", label: "Pending" }
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>
          {cfg.label}
        </span>
      )
    }
    if (columnId === "action") {
      return (
        <div className="flex items-center justify-center gap-1">
          <button
            title="Edit"
            onClick={() => { setEditTask(row); setOpenEditTask(true) }}
            className="inline-flex items-center justify-center rounded-xl border border-input bg-white p-1.5 hover:bg-muted transition-colors cursor-pointer"
          >
            <IconEdit className="size-4" />
          </button>
          <button
            title="Delete"
            onClick={() => { setDeleteTask(row); setOpenDeleteTask(true) }}
            className="inline-flex items-center justify-center rounded-xl border border-input bg-white p-1.5 text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <IconTrash className="size-4" />
          </button>
        </div>
      )
    }
    return null
  }

  const handleAddTask = async (data) => {
    const response = await fetch("http://localhost:5000/api/tasks/create", {
      method: "POST",
      headers: authHeaders,
      body: JSON.stringify({ title: data.title, description: data.description }),
    })
    if (response.ok) {
      toast.success("Task added successfully")
      setOpenAddTask(false)
      reset()
      setSearchTrigger((n) => n + 1)
    } else {
      toast.error("Failed to add task")
    }
  }

  const handleEditTask = async (data) => {
    const response = await fetch(`http://localhost:5000/api/tasks/update/${editTask.id}`, {
      method: "PUT",
      headers: authHeaders,
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        user_id: Number(data.user_id),
        status: data.status,
      }),
    })
    if (response.ok) {
      toast.success("Task updated successfully")
      setOpenEditTask(false)
      setSearchTrigger((n) => n + 1)
    } else {
      toast.error("Failed to update task")
    }
  }

  const handleDeleteTask = async () => {
    const response = await fetch(`http://localhost:5000/api/tasks/delete/${deleteTask.id}`, {
      method: "DELETE",
      headers: authHeaders,
    })
    if (response.ok) {
      toast.success("Task deleted successfully")
      setOpenDeleteTask(false)
      setSearchTrigger((n) => n + 1)
    } else {
      toast.error("Failed to delete task")
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          size="lg"
          onClick={() => setOpenAddTask(true)}
          className="flex gap-2 rounded-2xl bg-cyan-950 text-white border-none cursor-pointer hover:bg-cyan-900 hover:text-white"
        >
          <IconPlus /> Add Task
        </Button>
      </div>

      <div className="w-full">
        <DataTable key={searchTrigger} columns={columns} apiUrl={apiUrl} renderCell={renderCell} />
      </div>

      {/* Add Task Dialog */}
      <Dialog open={openAddTask} onOpenChange={setOpenAddTask}>
        <DialogContent className="rounded-2xl" align="start">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              <span className="text-cyan-950">Add Task</span>
            </DialogTitle>
          </DialogHeader>
          <FieldGroup className="gap-4">
            <Field orientation="horizontal">
              <FieldLabel htmlFor="add-title" className="w-1">Title</FieldLabel>
              <div className="flex-1">
                <Input id="add-title" placeholder="Enter title" {...register("title")} />
                <FieldError>{errors.title?.message}</FieldError>
              </div>
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="add-description" className="w-1">Description</FieldLabel>
              <div className="flex-1">
                <Input id="add-description" placeholder="Enter description" {...register("description")} />
                <FieldError>{errors.description?.message}</FieldError>
              </div>
            </Field>
          </FieldGroup>
          <Button
            onClick={handleSubmit(handleAddTask)}
            size="lg"
            className="flex gap-2 rounded-2xl bg-cyan-950 text-white border-none cursor-pointer hover:bg-cyan-900 cursor-pointer"
          >
            <IconPlus /> Add Task
          </Button>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={openEditTask} onOpenChange={setOpenEditTask}>
        <DialogContent className="rounded-2xl" align="start">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              <span className="text-cyan-950">Edit Task</span>
            </DialogTitle>
          </DialogHeader>
          <FieldGroup className="gap-4">
            <Field orientation="horizontal">
              <FieldLabel htmlFor="edit-title" className="w-1">Title</FieldLabel>
              <div className="flex-1">
                <Input id="edit-title" placeholder="Enter title" {...editRegister("title")} />
                <FieldError>{editErrors.title?.message}</FieldError>
              </div>
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="edit-description" className="w-1">Description</FieldLabel>
              <div className="flex-1">
                <Input id="edit-description" placeholder="Enter description" {...editRegister("description")} />
                <FieldError>{editErrors.description?.message}</FieldError>
              </div>
            </Field>
            <Field orientation="horizontal">
              <FieldLabel className="w-1">Assign To</FieldLabel>
              <div className="flex-1">
                <Controller
                  control={editControl}
                  name="user_id"
                  render={({ field }) => (
                    <UserCombobox
                      value={field.value}
                      onChange={field.onChange}
                      initialLabel={editTask.username || ''}
                      error={!!editErrors.user_id}
                    />
                  )}
                />
                <FieldError>{editErrors.user_id?.message}</FieldError>
              </div>
            </Field>
            <Field orientation="horizontal">
              <FieldLabel htmlFor="edit-status" className="w-1">Status</FieldLabel>
              <div className="flex-1">
                <div className="relative">
                  <select
                    id="edit-status"
                    {...editRegister("status")}
                    className="appearance-none h-9 w-full rounded-3xl border border-transparent bg-input/50 px-3 pr-9 text-sm font-normal cursor-pointer outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-50"
                  >
                    <option value="">Select status...</option>
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <IconChevronDown className="size-4 absolute right-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                </div>
                <FieldError>{editErrors.status?.message}</FieldError>
              </div>
            </Field>
          </FieldGroup>
          <Button
            onClick={editHandleSubmit(handleEditTask)}
            size="lg"
            className="flex gap-2 rounded-2xl bg-cyan-950 text-white border-none cursor-pointer hover:bg-cyan-900"
          >
            <IconEdit /> Save Changes
          </Button>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteTask} onOpenChange={setOpenDeleteTask}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-destructive"><span className="text-destructive">Delete Task</span></DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-1">
              Are you sure you want to delete <span className="font-semibold text-foreground">"{deleteTask.title}"</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setOpenDeleteTask(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white border-none"
              onClick={handleDeleteTask}
            >
              <IconTrash /> Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default Task

import { useState, useEffect, useRef } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "#components/ui/popover"
import { IconChevronDown, IconCheck, IconLoader, IconSearch, IconUserCircle } from "@tabler/icons-react"
import { cn } from "#lib/utils"

const FORM_CONTROL_CLASS =
  "flex h-9 w-full items-center justify-between rounded-3xl border border-transparent bg-input/50 px-3 text-sm font-normal transition-[color,box-shadow,background-color] outline-none cursor-pointer focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-50 disabled:cursor-not-allowed"

const nameFromEmail = (email) => (email ? email.split('@')[0] : '')
const initial = (email) => (email ? email[0].toUpperCase() : '?')

const UserCombobox = ({ value, onChange, initialLabel = '', error = false }) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState('')
  const cancelRef = useRef(false)

  useEffect(() => {
    if (!open) return
    cancelRef.current = false
    const delay = search ? 300 : 0
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `http://localhost:5000/api/dropdown/user?keyword=${encodeURIComponent(search)}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        )
        const data = await res.json()
        if (!cancelRef.current) {
          setOptions(Array.isArray(data.data) ? data.data : [])
        }
      } catch {
        if (!cancelRef.current) setOptions([])
      } finally {
        if (!cancelRef.current) setLoading(false)
      }
    }, delay)

    return () => {
      cancelRef.current = true
      clearTimeout(timer)
    }
  }, [open, search])

  const handleSelect = (user) => {
    onChange(String(user.id))
    setSelectedLabel(user.email)
    setOpen(false)
    setSearch('')
  }

  const displayLabel = selectedLabel || initialLabel || (value ? `User #${value}` : '')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            FORM_CONTROL_CLASS,
            !displayLabel && "text-muted-foreground",
            error && "border-destructive ring-3 ring-destructive/20"
          )}
        >
          <span className="truncate">{displayLabel || 'Select user...'}</span>
          <IconChevronDown className="size-4 shrink-0 opacity-50 ml-2" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-80 rounded-2xl shadow-xl border-border/60 overflow-hidden"
        align="start"
        sideOffset={6}
      >
        {/* Search header */}
        <div className="relative border-b bg-muted/40 p-2.5">
          <IconSearch className="size-4 absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            placeholder="Search users by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="h-9 w-full rounded-full bg-white border border-transparent pl-9 pr-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 placeholder:text-muted-foreground"
          />
        </div>

        {/* Options list */}
        <div className="max-h-64 overflow-y-auto p-1.5">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground gap-2">
              <IconLoader className="size-4 animate-spin" /> Searching…
            </div>
          ) : options.length === 0 ? (
            <div className="flex flex-col items-center gap-1 py-8 text-sm text-muted-foreground">
              <IconUserCircle className="size-8 opacity-30" />
              <p>No users found</p>
            </div>
          ) : (
            options.map((user) => {
              const isSelected = String(user.id) === String(value)
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelect(user)}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-sm cursor-pointer text-left transition-colors",
                    isSelected ? "bg-cyan-50" : "hover:bg-muted"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      isSelected ? "bg-cyan-950 text-white" : "bg-muted text-foreground"
                    )}
                  >
                    {initial(user.email)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("truncate font-medium", isSelected && "text-cyan-950")}>
                      {nameFromEmail(user.email)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
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

export default UserCombobox

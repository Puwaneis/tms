import { useState, useEffect } from "react"
import { Skeleton } from "#components/ui/skeleton"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "#components/ui/pagination"
import { IconInbox } from "@tabler/icons-react"

/**
 * DataTable
 *
 * Props:
 *   columns     – [{ id, label, accessor (string), align? }]
 *   apiUrl      – base URL; page & pageSize appended as query params
 *   renderCell  – optional (columnId, row) => ReactNode | null
 *                 Return null to fall back to row[accessor]
 */
const ALIGN = { left: "text-left", center: "text-center", right: "text-right" }

const DataTable = ({ columns, apiUrl, renderCell }) => {
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const headers = new Headers({
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        })
        const res = await fetch(`${apiUrl}?page=${page}&pageSize=${pageSize}`, {
          headers,
          cache: "no-store",
        })
        const data = await res.json()
        if (!cancelled) {
          if (!res.ok) {
            setError(data.message || "Failed to load data")
            setRows([])
            setTotal(0)
          } else {
            setRows(Array.isArray(data.data) ? data.data : [])
            setTotal(typeof data.total === "number" ? data.total : 0)
          }
        }
      } catch {
        if (!cancelled) {
          setError("Network error — check server connection")
          setRows([])
          setTotal(0)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [page, pageSize, apiUrl])

  const cellContent = (column, row) => {
    if (renderCell) {
      const custom = renderCell(column.id, row)
      if (custom !== null && custom !== undefined) return custom
    }
    const val = row[column.accessor]
    return val !== null && val !== undefined ? String(val) : (
      <span className="text-muted-foreground">—</span>
    )
  }

  return (
    <div className="rounded-2xl border bg-white overflow-hidden shadow-sm">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* Header */}
          <thead>
            <tr className="bg-cyan-950 text-white">
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={`px-4 py-3 font-semibold tracking-wide text-sm ${ALIGN[col.align] || "text-left"}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-muted/30"}>
                  {columns.map((col) => (
                    <td key={col.id} className="px-4 py-3">
                      <Skeleton className="h-4 w-full rounded-lg" />
                    </td>
                  ))}
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <p className="text-destructive font-medium">{error}</p>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <IconInbox className="size-10 opacity-30" />
                    <p className="text-sm">No records found</p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr
                  key={row.id ?? i}
                  className={`border-t transition-colors hover:bg-cyan-50/50 ${i % 2 === 0 ? "bg-white" : "bg-muted/20"}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      className={`px-4 py-3 ${ALIGN[col.align] || "text-left"}`}
                    >
                      {cellContent(col, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="flex items-center justify-between gap-4 border-t bg-muted/20 px-4 py-2">
        <span className="text-xs text-muted-foreground">
          {loading
            ? "Loading…"
            : total > 0
            ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total} records`
            : "No records"}
        </span>
        <Pagination className="mx-0 w-auto">
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-disabled={page <= 1}
                className={`rounded-xl text-xs h-8 ${page <= 1 ? "pointer-events-none opacity-40" : "cursor-pointer hover:bg-muted"}`}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="px-3 text-xs text-muted-foreground select-none whitespace-nowrap">
                Page {page} of {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-disabled={page >= totalPages}
                className={`rounded-xl text-xs h-8 ${page >= totalPages ? "pointer-events-none opacity-40" : "cursor-pointer hover:bg-muted"}`}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

export default DataTable

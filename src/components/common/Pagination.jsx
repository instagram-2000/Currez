import { useMemo } from 'react'
import NavIcon from './NavIcon'

function Pagination({ currentPage, totalItems, pageSize = 10, onPageChange }) {
  const totalPages = Math.ceil(totalItems / pageSize)

  if (totalPages <= 1) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const pageNumbers = useMemo(() => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      if (currentPage <= 3) {
        end = Math.min(4, totalPages - 1)
      }
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3)
      }

      if (start > 2) pages.push('...')
      for (let i = start; i <= end; i++) pages.push(i)
      if (end < totalPages - 1) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }, [currentPage, totalPages])

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <p className="text-sm text-muted">
        Showing <span className="font-medium text-heading">{startItem}</span>
        {' '}&mdash;{' '}
        <span className="font-medium text-heading">{endItem}</span>
        {' '}of{' '}
        <span className="font-medium text-heading">{totalItems}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-card text-muted transition-all hover:bg-card-strong hover:text-heading disabled:cursor-not-allowed disabled:opacity-40"
        >
          <NavIcon name="arrowLeft" className="h-4 w-4" />
        </button>

        {pageNumbers.map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-sm text-faint">
              &hellip;
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`inline-flex h-9 min-w-[36px] items-center justify-center rounded-lg px-2 text-sm font-medium transition-all ${
                currentPage === page
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                  : 'border border-line bg-card text-muted hover:bg-card-strong hover:text-heading'
              }`}
            >
              {page}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-card text-muted transition-all hover:bg-card-strong hover:text-heading disabled:cursor-not-allowed disabled:opacity-40"
        >
          <NavIcon name="arrowLeft" className="h-4 w-4 rotate-180" />
        </button>
      </div>
    </div>
  )
}

export default Pagination

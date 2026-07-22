import Modal from './Modal'
import NavIcon from './NavIcon'

// Shared icon-badge confirmation dialog — used anywhere a destructive or
// state-changing action needs a second step (deactivate staff, delete a
// hospital, send a reset email, ...).
function ConfirmModal({ title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel, busy }) {
  return (
    <Modal onClose={onCancel} className="max-w-sm">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            danger
              ? 'bg-red-500/10 ring-1 ring-inset ring-red-500/20'
              : 'bg-indigo-500/10 ring-1 ring-inset ring-indigo-500/20'
          }`}
        >
          <NavIcon
            name={danger ? 'close' : 'check'}
            className={`h-5 w-5 ${danger ? 'text-red-600 dark:text-red-400' : 'text-indigo-600 dark:text-indigo-300'}`}
          />
        </div>
        <h2 className="text-base font-semibold text-heading">{title}</h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          disabled={busy}
          className="cursor-pointer rounded-xl border border-line px-4 py-2 text-sm font-medium text-body transition-colors hover:bg-card-strong hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={busy}
          className={`cursor-pointer rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
            danger
              ? 'bg-red-600 shadow-red-500/25 hover:bg-red-500 hover:shadow-md'
              : 'bg-indigo-600 shadow-indigo-500/25 hover:bg-indigo-500 hover:shadow-md'
          }`}
        >
          {busy ? 'Working…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmModal

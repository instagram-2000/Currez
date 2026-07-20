import Modal from '../common/Modal'
import BookAppointmentForm from './BookAppointmentForm'

function BookAppointmentModal({ slug, onClose, onCheckStatus }) {
  return (
    <Modal onClose={onClose} className="max-w-xl">
      <BookAppointmentForm slug={slug} onCheckStatus={onCheckStatus} />
    </Modal>
  )
}

export default BookAppointmentModal

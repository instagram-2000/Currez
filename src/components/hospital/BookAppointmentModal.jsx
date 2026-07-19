import Modal from '../common/Modal'
import BookAppointmentForm from './BookAppointmentForm'

function BookAppointmentModal({ slug, onClose, onCheckStatus }) {
  return (
    <Modal onClose={onClose}>
      <BookAppointmentForm slug={slug} onCheckStatus={onCheckStatus} />
    </Modal>
  )
}

export default BookAppointmentModal

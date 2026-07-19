import Modal from '../common/Modal'
import CheckStatusForm from './CheckStatusForm'

function CheckStatusModal({ slug, onClose }) {
  return (
    <Modal onClose={onClose}>
      <CheckStatusForm slug={slug} />
    </Modal>
  )
}

export default CheckStatusModal

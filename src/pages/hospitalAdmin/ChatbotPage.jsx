// Reference implementation for NEW_MODULE_DEVELOPMENT_GUIDE.md — the
// Chatbot module. Only reachable when this hospital's `chatbot` feature is
// enabled (see RequireFeature in App.jsx); the sidebar link only renders
// under the same condition (see HospitalPortalLayout). The conversational
// logic itself is out of scope here — this proves the access-control
// wiring end to end.
function ChatbotPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-heading">Chatbot</h1>
      <p className="mt-1 text-sm text-muted">
        AI assistant for patients to book appointments, ask hospital questions and navigate services.
      </p>

      <div className="mt-6 max-w-lg rounded-2xl border border-line bg-card p-5">
        <p className="text-sm text-body">
          This module is enabled for your hospital. Conversational features build here.
        </p>
      </div>
    </div>
  )
}

export default ChatbotPage

import { createPortal } from 'react-dom'

// Renders printable content as a sibling of #root (via a portal straight to
// document.body) instead of nested inside the calling modal's DOM.
//
// Why: the earlier approach kept the print content inside the modal and
// tried to "escape" it with position:absolute + a visibility:hidden trick
// on everything else. That silently failed for anything longer than one
// screen, because the modal's own wrapper has max-h-[85vh] + overflow-y-auto
// AND a permanent (post-animation) CSS transform from animate-fade-in-up —
// a non-none transform on an ancestor creates a new containing block, so
// even position:fixed content stayed trapped inside that scrollable,
// height-capped box and printed cut off or blank.
//
// A portal sidesteps all of that: this content lives outside the modal's
// DOM subtree entirely, and index.css hides #root (and therefore the whole
// visible app, including the modal) during @media print, so this is the
// only thing left to print — full-length, normally paginated, no clipping.
function PrintPortal({ children }) {
  return createPortal(<div className="hidden print:block">{children}</div>, document.body)
}

export default PrintPortal

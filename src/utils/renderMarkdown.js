// Lightweight markdown → HTML for doctor bios.
// Supports: headings, bold, italic, inline code, links, unordered/ordered lists,
// blockquotes, horizontal rules, and paragraphs. No external deps.
export function renderMarkdown(md) {
  if (!md) return ''

  const lines = md.replace(/\r\n/g, '\n').split('\n')
  const html = []
  let inList = false
  let listType = ''
  let inBlockquote = false

  function closeList() {
    if (inList) {
      html.push(listType === 'ol' ? '</ol>' : '</ul>')
      inList = false
    }
  }
  function closeBlockquote() {
    if (inBlockquote) {
      html.push('</blockquote>')
      inBlockquote = false
    }
  }

  for (const raw of lines) {
    const line = raw.trimEnd()

    // blank line — close open blocks
    if (line.trim() === '') {
      closeList()
      closeBlockquote()
      continue
    }

    // horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      closeList()
      closeBlockquote()
      html.push('<hr/>')
      continue
    }

    // headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/)
    if (headingMatch) {
      closeList()
      closeBlockquote()
      const level = headingMatch[1].length
      html.push(`<h${level}>${inlineMd(headingMatch[2])}</h${level}>`)
      continue
    }

    // unordered list
    if (/^[\s]*[-*+]\s+/.test(line)) {
      closeBlockquote()
      if (!inList || listType !== 'ul') {
        closeList()
        html.push('<ul>')
        inList = true
        listType = 'ul'
      }
      html.push(`<li>${inlineMd(line.replace(/^[\s]*[-*+]\s+/, ''))}</li>`)
      continue
    }

    // ordered list
    if (/^[\s]*\d+\.\s+/.test(line)) {
      closeBlockquote()
      if (!inList || listType !== 'ol') {
        closeList()
        html.push('<ol>')
        inList = true
        listType = 'ol'
      }
      html.push(`<li>${inlineMd(line.replace(/^[\s]*\d+\.\s+/, ''))}</li>`)
      continue
    }

    // blockquote
    if (/^>\s?/.test(line)) {
      closeList()
      if (!inBlockquote) {
        html.push('<blockquote>')
        inBlockquote = true
      }
      html.push(`<p>${inlineMd(line.replace(/^>\s?/, ''))}</p>`)
      continue
    }

    // paragraph
    closeList()
    closeBlockquote()
    html.push(`<p>${inlineMd(line)}</p>`)
  }

  closeList()
  closeBlockquote()
  return html.join('\n')
}

function inlineMd(text) {
  return text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
}

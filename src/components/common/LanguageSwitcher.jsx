import { useLanguage } from '../../contexts/LanguageContext'
import { LANGUAGES } from '../../i18n/translations'

// Small globe-icon dropdown — deliberately minimal so it drops into any
// navbar/header without needing layout changes around it.
function LanguageSwitcher({ className = '' }) {
  const { language, setLanguage } = useLanguage()

  return (
    <label className={`inline-flex cursor-pointer items-center gap-1 text-sm text-muted ${className}`}>
      <span aria-hidden="true">🌐</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        aria-label="Select language"
        className="cursor-pointer border-none bg-transparent pr-1 text-sm font-medium text-body focus:outline-none"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export default LanguageSwitcher

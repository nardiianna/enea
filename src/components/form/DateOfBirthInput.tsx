import { useEffect, useState } from 'react'

interface Parts {
  day: string
  month: string
  year: string
}

function parseIso(iso?: string | null): Parts {
  if (!iso) return { day: '', month: '', year: '' }
  const [y, m, d] = iso.split('-')
  return { day: d ?? '', month: m ?? '', year: y ?? '' }
}

const boxCls =
  'mt-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-2 text-sm text-center disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-500'

export function DateOfBirthInput({
  value,
  onChange,
  disabled,
}: {
  value: string | null | undefined
  onChange: (iso: string | null) => void
  disabled?: boolean
}) {
  const [parts, setParts] = useState<Parts>(parseIso(value))

  useEffect(() => {
    setParts(parseIso(value))
  }, [value])

  function update(patch: Partial<Parts>) {
    const next = { ...parts, ...patch }
    setParts(next)
    const { day, month, year } = next
    if (day && month && year && year.length === 4) {
      onChange(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
    } else if (!day && !month && !year) {
      onChange(null)
    }
  }

  return (
    <div>
      <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data di nascita</span>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="GG"
          className={`${boxCls} w-16`}
          disabled={disabled}
          value={parts.day}
          onChange={(e) => update({ day: e.target.value.slice(0, 2) })}
        />
        <span className="text-gray-400">/</span>
        <input
          type="number"
          placeholder="MM"
          className={`${boxCls} w-16`}
          disabled={disabled}
          value={parts.month}
          onChange={(e) => update({ month: e.target.value.slice(0, 2) })}
        />
        <span className="text-gray-400">/</span>
        <input
          type="number"
          placeholder="AAAA"
          className={`${boxCls} w-20`}
          disabled={disabled}
          value={parts.year}
          onChange={(e) => update({ year: e.target.value.slice(0, 4) })}
        />
      </div>
    </div>
  )
}

const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300'
const inputCls =
  'mt-1 w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-500'

export function TextInput({
  label,
  value,
  onChange,
  disabled,
  type = 'text',
}: {
  label: string
  value: string | number | null | undefined
  onChange: (v: string) => void
  disabled?: boolean
  type?: string
}) {
  return (
    <label className={labelCls}>
      {label}
      <input
        type={type}
        className={inputCls}
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  )
}

export function NumberInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: number | null | undefined
  onChange: (v: number | null) => void
  disabled?: boolean
}) {
  return (
    <label className={labelCls}>
      {label}
      <input
        type="number"
        step={1}
        className={inputCls}
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => {
          if (e.target.value === '') {
            onChange(null)
            return
          }
          const n = Number(e.target.value)
          if (!Number.isNaN(n)) onChange(Math.trunc(n))
        }}
      />
    </label>
  )
}

export function SelectInput<T extends string>({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string
  value: T | null | undefined
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  disabled?: boolean
}) {
  return (
    <label className={labelCls}>
      {label}
      <select
        className={inputCls}
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
      >
        <option value="" disabled>
          Seleziona...
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function BoolRadio({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: boolean | null | undefined
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <div>
      <span className={labelCls}>{label}</span>
      <div className="mt-1 flex gap-4">
        {[true, false].map((opt) => (
          <label key={String(opt)} className="flex items-center gap-1 text-sm">
            <input
              type="radio"
              disabled={disabled}
              checked={value === opt}
              onChange={() => onChange(opt)}
            />
            {opt ? 'Sì' : 'No'}
          </label>
        ))}
      </div>
    </div>
  )
}

export function Checkbox({
  label,
  checked,
  onChange,
  disabled,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  )
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded border border-gray-200 dark:border-gray-700 p-4">
      <legend className="px-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
        {title}
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </fieldset>
  )
}

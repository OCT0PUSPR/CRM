import { useId } from 'react'

import { LucideIcon } from 'lucide-react'

import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface SelectOption {
  value: string | number
  label: string
}

interface SelectWithIconProps {
  label?: string
  options: SelectOption[]
  value: string
  onChange: (val: string) => void
  icon: LucideIcon
  placeholder?: string
  className?: string
}

const SelectWithIcon = ({ 
  label, 
  options, 
  value, 
  onChange, 
  icon: Icon, 
  placeholder, 
  className 
}: SelectWithIconProps) => {
  const id = useId()

  return (
    <div className={`w-full max-w-xs space-y-2 ${className}`}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className='relative w-full pl-9'>
          <div className='text-muted-foreground/80 pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3'>
            <Icon size={16} aria-hidden='true' />
          </div>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value.toString()}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default SelectWithIcon

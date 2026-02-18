'use client'

import { useState } from 'react'

import { type DateRange } from 'react-day-picker'

import { Calendar } from './ui/calendar'

interface DateRangePickerProps {
  value: DateRange | undefined
  onChange: (date: DateRange | undefined) => void
  label?: string
}

const DateRangePicker = ({ value, onChange, label }: DateRangePickerProps) => {
  return (
    <div>
      <Calendar
        mode='range'
        defaultMonth={value?.from}
        selected={value}
        onSelect={onChange}
        numberOfMonths={2}
        className='rounded-lg border'
      />
      {label && (
        <p className='text-muted-foreground mt-3 text-center text-xs' role='region'>
          {label}
        </p>
      )}
    </div>
  )
}

export default DateRangePicker

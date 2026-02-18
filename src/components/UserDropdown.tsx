'use client'

import { useId, useState } from 'react'

import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from './ui/command'
import { Label } from './ui/label'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'

interface UserOption {
  id: number | string
  name: string
  email?: string
  avatar?: string
}

interface UserDropdownProps {
  users: UserOption[]
  value: string | number
  onChange: (val: string) => void
  label?: string
  placeholder?: string
  className?: string
  onSearch?: (search: string) => void
  isLoading?: boolean
}

const UserDropdown = ({
  users,
  value,
  onChange,
  label,
  placeholder = 'Select user',
  className,
  onSearch,
  isLoading
}: UserDropdownProps) => {
  const id = useId()
  const [open, setOpen] = useState(false)

  const selectedUser = users.find(user => user.id.toString() === value.toString())

  return (
    <div className={`w-full max-w-xs space-y-2 ${className}`}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button id={id} variant='outline' role='combobox' aria-expanded={open} className='w-full justify-between h-auto py-2'>
            {selectedUser ? (
              <span className='flex gap-2 items-center text-left'>
                <Avatar className='size-8'>
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className='font-medium text-sm leading-tight'>{selectedUser.name}</span>
                  {selectedUser.email && <span className='text-xs text-muted-foreground'>{selectedUser.email}</span>}
                </div>
              </span>
            ) : (
              <span className='text-muted-foreground'>{placeholder}</span>
            )}
            <ChevronsUpDownIcon className='text-muted-foreground/80 shrink-0 ml-2' size={16} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[300px] p-0' align="start">
          <Command shouldFilter={!onSearch}>
            <CommandInput 
              placeholder='Search user...' 
              onValueChange={onSearch}
            />
            <CommandList>
              {isLoading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
              ) : (
                <>
                  <CommandEmpty>No users found.</CommandEmpty>
                  <CommandGroup>
                    {users.map(user => (
                      <CommandItem
                        key={user.id}
                        value={user.name}
                        onSelect={() => {
                          onChange(user.id.toString())
                          setOpen(false)
                        }}
                        className="flex items-center gap-2 py-2"
                      >
                        <Avatar className='size-8'>
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className='flex flex-col flex-1'>
                          <span className='font-medium text-sm'>{user.name}</span>
                          {user.email && <span className='text-muted-foreground text-xs'>{user.email}</span>}
                        </span>
                        {value.toString() === user.id.toString() && <CheckIcon size={16} className='ml-auto text-primary' />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default UserDropdown

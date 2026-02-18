'use client'

import { LucideIcon, ChevronRightIcon, CircleSmallIcon } from 'lucide-react'

import { Button } from './ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuTrigger
} from './ui/dropdown-menu'

interface CollapsableItem {
  label: string
  icon?: LucideIcon
  onClick?: () => void
}

interface CollapsableGroup {
  label: string
  icon: LucideIcon
  items: CollapsableItem[]
}

interface CollapsableDropdownProps {
  triggerLabel: string
  groups: CollapsableGroup[]
  topItems?: CollapsableItem[]
  bottomItems?: CollapsableItem[]
}

const CollapsableDropdown = ({ 
  triggerLabel, 
  groups, 
  topItems = [], 
  bottomItems = [] 
}: CollapsableDropdownProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline'>{triggerLabel}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56'>
        {topItems.map((item, idx) => (
          <DropdownMenuItem key={idx} onClick={item.onClick}>
            {item.icon && <item.icon size={16} />}
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
        
        {groups.map((group, groupIdx) => (
          <Collapsible key={groupIdx} asChild>
            <DropdownMenuGroup>
              <CollapsibleTrigger asChild>
                <DropdownMenuItem onSelect={event => event.preventDefault()} className='justify-between'>
                  <div className='flex items-center gap-2'>
                    <group.icon size={16} />
                    <span>{group.label}</span>
                  </div>
                  <ChevronRightIcon className='shrink-0 transition-transform [[data-state="open"]>&]:rotate-90' size={16} />
                </DropdownMenuItem>
              </CollapsibleTrigger>
              <CollapsibleContent className='pl-4'>
                {group.items.map((item, itemIdx) => (
                  <DropdownMenuItem key={itemIdx} onClick={item.onClick}>
                    {item.icon ? <item.icon size={16} /> : <CircleSmallIcon size={16} />}
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                ))}
              </CollapsibleContent>
            </DropdownMenuGroup>
          </Collapsible>
        ))}

        {bottomItems.map((item, idx) => (
          <DropdownMenuItem key={idx} onClick={item.onClick}>
            {item.icon && <item.icon size={16} />}
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default CollapsableDropdown

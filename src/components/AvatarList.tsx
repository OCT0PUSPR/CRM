import { ChevronUpIcon, PlusIcon } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'

interface AvatarListItem {
  image?: string
  fallback: string
  name: string
  designation?: string
  percentage?: number
  value?: string | number
}

interface AvatarListProps {
  items: AvatarListItem[]
  title?: string
  onAdd?: () => void
  maxInitialItems?: number
}

const AvatarList = ({ items, title, onAdd, maxInitialItems = 2 }: AvatarListProps) => {
  return (
    <Collapsible className='flex w-full flex-col items-start gap-4'>
      <div className="flex items-center justify-between w-full">
        <div className='font-medium'>{title}</div>
        {onAdd && (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onAdd}>
            <PlusIcon size={16} />
          </Button>
        )}
      </div>
      <ul className='flex w-full flex-col gap-2'>
        {items.slice(0, maxInitialItems).map((item, idx) => (
          <li key={`${item.name}-${idx}`} className='flex items-start gap-4'>
            <Avatar>
              <AvatarImage src={item.image} alt={item.name} />
              <AvatarFallback>{item.fallback}</AvatarFallback>
            </Avatar>
            <div className='flex flex-1 flex-col'>
              <div className='text-sm font-medium'>{item.name}</div>
              {item.designation && <p className='text-muted-foreground text-xs'>{item.designation}</p>}
            </div>
            {item.percentage !== undefined && (
              <span className='text-muted-foreground text-sm'>{`${item.percentage}%`}</span>
            )}
            {item.value !== undefined && (
              <span className='text-muted-foreground text-sm'>{item.value}</span>
            )}
          </li>
        ))}
        {items.length > maxInitialItems && (
          <CollapsibleContent className='flex flex-col gap-2'>
            {items.slice(maxInitialItems).map((item, idx) => (
              <li key={`${item.name}-${idx + maxInitialItems}`} className='flex items-start gap-4'>
                <Avatar>
                  <AvatarImage src={item.image} alt={item.name} />
                  <AvatarFallback>{item.fallback}</AvatarFallback>
                </Avatar>
                <div className='flex flex-1 flex-col'>
                  <div className='text-sm font-medium'>{item.name}</div>
                  {item.designation && <p className='text-muted-foreground text-xs'>{item.designation}</p>}
                </div>
                {item.percentage !== undefined && (
                  <span className='text-muted-foreground text-sm'>{`${item.percentage}%`}</span>
                )}
                {item.value !== undefined && (
                  <span className='text-muted-foreground text-sm'>{item.value}</span>
                )}
              </li>
            ))}
          </CollapsibleContent>
        )}
      </ul>
      {items.length > maxInitialItems && (
        <CollapsibleTrigger asChild>
          <Button variant='outline' size='sm'>
            <span className='[[data-state=open]>&]:hidden'>Show more</span>
            <span className='[[data-state=closed]>&]:hidden'>Show less</span>
            <ChevronUpIcon className='[[data-state=closed]>&]:rotate-180' />
          </Button>
        </CollapsibleTrigger>
      )}
    </Collapsible>
  )
}

export default AvatarList

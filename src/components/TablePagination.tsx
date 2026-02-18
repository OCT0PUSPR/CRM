import { useId } from 'react'

import { ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink
} from '@/components/ui/pagination'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface TablePaginationProps {
  totalItems: number
  itemsPerPage: number
  currentPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: string) => void
  labelText?: string
  rowsPerPageOptions?: string[]
}

const TablePagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
  onItemsPerPageChange,
  labelText = 'products',
  rowsPerPageOptions = ['10', '25', '50']
}: TablePaginationProps) => {
  const id = useId()
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  const from = (currentPage - 1) * itemsPerPage + 1
  const to = Math.min(currentPage * itemsPerPage, totalItems)

  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1)

  return (
    <div className='flex w-full flex-wrap items-center justify-between gap-6 max-sm:justify-center'>
      <div className='flex shrink-0 items-center gap-3'>
        <Label htmlFor={id}>Rows per page</Label>
        <Select value={itemsPerPage.toString()} onValueChange={onItemsPerPageChange}>
          <SelectTrigger id={id} className='w-fit whitespace-nowrap'>
            <SelectValue placeholder='Select' />
          </SelectTrigger>
          <SelectContent className='[&_*[role=option]]:pr-8 [&_*[role=option]]:pl-2 [&_*[role=option]>span]:right-2 [&_*[role=option]>span]:left-auto'>
            {rowsPerPageOptions.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='text-muted-foreground flex grow items-center justify-end whitespace-nowrap max-sm:justify-center'>
        <p className='text-muted-foreground text-sm whitespace-nowrap' aria-live='polite'>
          Showing <span className='text-foreground'>{from}</span> to <span className='text-foreground'>{to}</span> of{' '}
          <span className='text-foreground'>{totalItems}</span> {labelText}
        </p>
      </div>
      <Pagination className='w-fit max-sm:mx-0'>
        <PaginationContent>
          <PaginationItem>
            <Button variant="ghost" size="icon" onClick={() => onPageChange(1)} disabled={currentPage === 1}>
              <ChevronFirstIcon className='size-4' />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button variant="ghost" size="icon" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
              <ChevronLeftIcon className='size-4' />
            </Button>
          </PaginationItem>
          {pages.map(page => (
            <PaginationItem key={page}>
              <PaginationLink 
                href="#" 
                onClick={(e) => { e.preventDefault(); onPageChange(page); }} 
                isActive={page === currentPage} 
                className='rounded-full'
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          {totalPages > 5 && (
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
          )}
          <PaginationItem>
            <Button variant="ghost" size="icon" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              <ChevronRightIcon className='size-4' />
            </Button>
          </PaginationItem>
          <PaginationItem>
            <Button variant="ghost" size="icon" onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages}>
              <ChevronLastIcon className='size-4' />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export default TablePagination

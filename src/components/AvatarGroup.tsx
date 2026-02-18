import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

interface AvatarItem {
  src?: string
  fallback: string
  name: string
}

interface AvatarGroupProps {
  items: AvatarItem[]
  size?: number
  className?: string
}

const AvatarGroup = ({ items, size = 48, className }: AvatarGroupProps) => {
  return (
    <div className={`flex -space-x-2 ${className}`}>
      {items.map((avatar, index) => (
        <Avatar key={index} className={`ring-background ring-2`} style={{ width: size, height: size }}>
          <AvatarImage src={avatar.src} alt={avatar.name} />
          <AvatarFallback>{avatar.fallback}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  )
}

export default AvatarGroup
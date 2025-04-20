import {
  LucideIcon,
  Home,
  Book,
  User,
  BicepsFlexed,
  Settings
} from 'lucide-react-native'

export interface NavItem {
  name: string
  path:
    | `/${string}/`
    | `/${string}/${string}/`
    | `/${string}/${string}/${string}/`
  icon: LucideIcon
  targetSegment: string | null
  protected?: boolean
  isTabItem: boolean
}

export const navItems: NavItem[] = [
  {
    name: 'Home',
    path: '/(main)/(tabs)/',
    icon: Home,
    targetSegment: 'index',
    isTabItem: true
  },
  {
    name: 'Reader',
    path: '/(main)/(tabs)/reader',
    icon: Book,
    targetSegment: 'reader',
    isTabItem: true
  },
  {
    name: 'Practice',
    path: '/(main)/(tabs)/exercises',
    icon: BicepsFlexed,
    targetSegment: 'exercises',
    isTabItem: true
  },
  {
    name: 'Profile',
    path: '/(main)/(tabs)/profile',
    icon: User,
    targetSegment: 'profile',
    protected: true,
    isTabItem: true
  },
  {
    name: 'Settings',
    path: '/(main)/settings/',
    icon: Settings,
    targetSegment: 'settings/index',
    protected: true,
    isTabItem: false
  }
]

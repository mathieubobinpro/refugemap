'use client'
import {
  Home, HeartPulse, Utensils, Droplets, BookOpen, Scale, Package,
  Search, Languages, MapPin, ChevronRight, ChevronLeft, ArrowLeft,
  ArrowRight, Phone, Navigation, Share2, Clock, Info, TriangleAlert,
  Layers, List, X, Check, WifiOff, Database, RefreshCw, Loader,
  Plus, Minus, SearchX,
} from 'lucide-react'

const ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties; className?: string }>> = {
  'home': Home,
  'heart-pulse': HeartPulse,
  'utensils': Utensils,
  'droplets': Droplets,
  'book-open': BookOpen,
  'scale': Scale,
  'package': Package,
  'search': Search,
  'languages': Languages,
  'map-pin': MapPin,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'phone': Phone,
  'navigation': Navigation,
  'share-2': Share2,
  'clock': Clock,
  'info': Info,
  'triangle-alert': TriangleAlert,
  'layers': Layers,
  'list': List,
  'x': X,
  'check': Check,
  'wifi-off': WifiOff,
  'database': Database,
  'refresh-cw': RefreshCw,
  'loader': Loader,
  'plus': Plus,
  'minus': Minus,
  'search-x': SearchX,
}

interface IconProps {
  name: string
  size?: number
  style?: React.CSSProperties
  className?: string
}

export function Icon({ name, size = 20, style, className }: IconProps) {
  const Comp = ICONS[name]
  if (!Comp) return null
  return <Comp size={size} style={style} className={className} />
}

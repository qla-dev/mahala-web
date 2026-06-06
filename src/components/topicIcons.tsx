import {
  Briefcase,
  Calendar,
  Eye,
  Gamepad2,
  Heart,
  HelpCircle,
  Home,
  Megaphone,
  MessageCircle,
  Moon,
  PawPrint,
  Search,
  Tag,
  Trophy,
  Users,
  Utensils,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type IconTopic = {
  icon?: string;
  slug?: string;
  key?: string;
};

export const GENERAL_TOPIC_BADGE_COLOR = '#d1d5db';

export const generalTopicIconMap: Record<string, string> = {
  glavna: 'chatbubble-ellipses',
  eventi: 'calendar',
  spotted: 'eye',
  posao: 'briefcase',
  ljubimci: 'paw',
  'izgubljeno-i-nadjeno': 'search',
  politika: 'megaphone',
  'nocna-smjena': 'moon',
  gaming: 'game-controller',
  sport: 'football',
  'prodajem-i-kupujem': 'pricetag',
  dating: 'heart',
};

const topicIconMap: Record<string, LucideIcon> = {
  briefcase: Briefcase,
  calendar: Calendar,
  cafe: Utensils,
  cart: Tag,
  'chatbubble-ellipses': MessageCircle,
  construct: HelpCircle,
  eye: Eye,
  flash: Zap,
  football: Trophy,
  'game-controller': Gamepad2,
  heart: Heart,
  help: HelpCircle,
  'help-circle': HelpCircle,
  home: Home,
  megaphone: Megaphone,
  moon: Moon,
  musical: HelpCircle,
  'musical-notes': HelpCircle,
  paw: PawPrint,
  people: Users,
  pricetag: Tag,
  restaurant: Utensils,
  search: Search,
};

export function resolveTopicIcon(topic: IconTopic) {
  const iconKey = topic.icon || generalTopicIconMap[topic.slug || topic.key || ''] || 'chatbubble-ellipses';
  return topicIconMap[iconKey] || MessageCircle;
}

export function resolveTopicIconSize(topic: IconTopic, fallbackSize: number) {
  return (topic.slug || topic.key) === 'spotted' ? fallbackSize + 3 : fallbackSize;
}

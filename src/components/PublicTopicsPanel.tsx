import {
  Briefcase,
  Calendar,
  Eye,
  Gamepad2,
  Heart,
  Megaphone,
  MessageCircle,
  Moon,
  PawPrint,
  Search,
  Sparkles,
  Tag,
  Trophy,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type PublicTopic = {
  id: string;
  name: string;
  slug: string;
  count: number;
  color?: string;
  description?: string;
  icon?: string;
  premium?: boolean;
  general?: boolean;
};

const topicIconMap: Record<string, LucideIcon> = {
  'briefcase': Briefcase,
  'calendar': Calendar,
  'chatbubble-ellipses': MessageCircle,
  'eye': Eye,
  'football': Trophy,
  'game-controller': Gamepad2,
  'heart': Heart,
  'megaphone': Megaphone,
  'moon': Moon,
  'paw': PawPrint,
  'pricetag': Tag,
  'search': Search,
};

const generalTopicIconMap: Record<string, string> = {
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

function resolveTopicIcon(topic: PublicTopic) {
  const iconKey = topic.icon || generalTopicIconMap[topic.slug] || 'chatbubble-ellipses';
  return topicIconMap[iconKey] || MessageCircle;
}

export default function PublicTopicsPanel({
  topics,
  activeTopic,
  onTopic,
}: {
  topics: PublicTopic[];
  activeTopic: string;
  onTopic: (id: string) => void;
}) {
  return (
    <section className="public-topics-panel">
      <div className="public-topics-header">
        <div>
          <p>Teme</p>
          <h2>Sta se prica u blizini</h2>
        </div>
        <Sparkles size={19} />
      </div>
      <div className="public-topic-list">
        {topics.filter((topic) => topic.id !== 'sve').map((topic) => (
          <TopicButton
            key={topic.id}
            topic={topic}
            active={activeTopic === topic.id}
            onClick={() => onTopic(topic.id)}
          />
        ))}
      </div>
    </section>
  );
}

function TopicButton({
  topic,
  active,
  onClick,
}: {
  key?: string;
  topic: PublicTopic;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = resolveTopicIcon(topic);
  const label = topic.slug || topic.name;

  return (
    <button
      className={`public-topic-card ${active ? 'active' : ''}`}
      type="button"
      onClick={onClick}
    >
      <span
        className={`public-topic-badge ${topic.general ? 'general' : ''}`}
        style={{ backgroundColor: topic.color || '#8b5cf6' }}
      >
        <Icon size={topic.slug === 'spotted' ? 21 : 19} />
      </span>
      <span className="public-topic-main">
        <span className="public-topic-title-row">
          <strong>@{label}</strong>
          {topic.premium ? (
            <span className="public-topic-pro">
              <Sparkles size={10} />
              PRO
            </span>
          ) : null}
        </span>
        <small>{topic.description || `${topic.count} objava`}</small>
      </span>
    </button>
  );
}

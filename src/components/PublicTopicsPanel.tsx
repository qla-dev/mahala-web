import { useMemo, useState } from 'react';
import {
  Search,
  Sparkles,
} from 'lucide-react';
import type { Topic } from '../types';
import { GENERAL_TOPIC_BADGE_COLOR, resolveTopicIcon, resolveTopicIconSize } from './topicIcons';

export default function PublicTopicsPanel({
  topics,
  activeTopic,
  onTopic,
}: {
  topics: Topic[];
  activeTopic: string;
  onTopic: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const { generalTopics, currentMahalaTopics } = useMemo(() => {
    const source = topics.filter((topic) => topic.id !== 'sve');
    const visibleTopics = normalizedQuery ? source.filter((topic) => {
      const searchableText = [topic.name, topic.slug, topic.description].filter(Boolean).join(' ').toLowerCase();
      return searchableText.includes(normalizedQuery);
    }) : source;

    return {
      generalTopics: visibleTopics.filter((topic) => topic.general),
      currentMahalaTopics: visibleTopics.filter((topic) => !topic.general),
    };
  }, [normalizedQuery, topics]);
  const hasSearchQuery = Boolean(query.trim());
  const isEmpty = generalTopics.length === 0 && currentMahalaTopics.length === 0;

  return (
    <section className="public-topics-panel">
      <div className="public-topics-topbar">
        <div className="public-topics-header">
          <div>
            <p>Teme</p>
            <h2>Sta se prica u blizini</h2>
          </div>
          <Sparkles size={19} />
        </div>
        <div className="public-topic-search-row">
          <label className="public-topic-search-shell">
            {!query ? <span>Pretrazi temu iz trenutnih MAHALA</span> : null}
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              aria-label="Pretrazi teme"
            />
          </label>
        </div>
      </div>
      <TopicSection
        title={hasSearchQuery ? 'Rezultati pretrage' : 'Generalne teme'}
        topics={generalTopics}
        activeTopic={activeTopic}
        onTopic={onTopic}
      />
      <TopicSection
        title={hasSearchQuery ? 'Rezultati iz trenutnih mahala' : 'Teme iz trenutnih mahala'}
        topics={currentMahalaTopics}
        activeTopic={activeTopic}
        onTopic={onTopic}
      />
      {isEmpty ? (
        <div className="public-topic-empty">
          <strong>Nema tema za ovu pretragu</strong>
          <span>Probaj drugi pojam</span>
        </div>
      ) : null}
    </section>
  );
}

function TopicSection({
  title,
  topics,
  activeTopic,
  onTopic,
}: {
  title: string;
  topics: Topic[];
  activeTopic: string;
  onTopic: (id: string) => void;
}) {
  if (topics.length === 0) {
    return null;
  }

  return (
    <>
      <p className="public-topic-section-label">{title}</p>
      <div className="public-topic-list">
        {topics.map((topic) => (
          <TopicButton
            key={topic.id}
            topic={topic}
            active={activeTopic === topic.id}
            onClick={() => onTopic(topic.id)}
          />
        ))}
      </div>
    </>
  );
}

function TopicButton({
  topic,
  active,
  onClick,
}: {
  key?: string;
  topic: Topic;
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
        style={{ backgroundColor: topic.general ? (topic.color || GENERAL_TOPIC_BADGE_COLOR) : (topic.color || '#8b5cf6') }}
      >
        <Icon size={resolveTopicIconSize(topic, 19)} />
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

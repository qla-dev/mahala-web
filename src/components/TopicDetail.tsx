import { Sparkles } from 'lucide-react';
import type { Topic } from '../types';
import { GENERAL_TOPIC_BADGE_COLOR, resolveTopicIcon, resolveTopicIconSize } from './topicIcons';

export default function TopicDetail({
  topics,
  activeTopic,
  onTopic,
}: {
  topics: Topic[];
  activeTopic: string;
  onTopic: (id: string) => void;
}) {
  return (
    <section className="topics-panel">
      <h2>Teme u mahalama</h2>
      <p>Prati price po temama i brzo nadji sta je trenutno bitno.</p>
      <div className="topic-grid">
        {topics.filter((topic) => topic.id !== 'sve').map((topic) => {
          const Icon = resolveTopicIcon(topic);
          const label = topic.slug || topic.name;

          return (
            <button
              key={topic.id}
              className={activeTopic === topic.id ? 'active' : ''}
              type="button"
              onClick={() => onTopic(topic.id)}
            >
              <span
                className={`topic-grid-badge ${topic.general ? 'general' : ''}`}
                style={{ backgroundColor: topic.general ? (topic.color || GENERAL_TOPIC_BADGE_COLOR) : (topic.color || '#8b5cf6') }}
              >
                <Icon size={resolveTopicIconSize(topic, 18)} />
              </span>
              <span className="topic-grid-main">
                <span className="topic-grid-title-row">
                  <strong>@{label}</strong>
                  {topic.premium ? (
                    <span className="topic-grid-pro">
                      <Sparkles size={10} />
                      PRO
                    </span>
                  ) : null}
                </span>
                <small>{topic.description || `${topic.count} objava`}</small>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

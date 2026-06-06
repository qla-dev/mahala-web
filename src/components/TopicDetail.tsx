import PublicTopicsPanel from './PublicTopicsPanel';
import type { Topic } from '../types';

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
    <PublicTopicsPanel
      topics={topics}
      activeTopic={activeTopic}
      onTopic={onTopic}
    />
  );
}

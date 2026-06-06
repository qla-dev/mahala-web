import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  MapContainer,
  Polygon,
  TileLayer,
  Tooltip,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import lottie from 'lottie-web';
import 'leaflet/dist/leaflet.css';
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Compass,
  Download,
  Flame,
  Heart,
  Home,
  MapPin,
  Menu,
  MessageCircle,
  Navigation,
  Search,
  Shield,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import endpoints from './api/endpoints';
import { CurrentMahalasSheet } from './components/CurrentMahalasFilter';
import PublicPostCard from './components/PublicPostCard';
import PublicTopicsPanel from './components/PublicTopicsPanel';
import mahalaJumpLogo from './assets/mahalaJumpLogo.json';
import { SARAJEVO_POLYGONS } from './data/sarajevoPolygons';

// @ts-ignore
import iconUrl from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

type Coordinate = { latitude: number; longitude: number };
type Zone = {
  id: string;
  name: string;
  level?: number | null;
  type?: string;
  sourceId?: string | null;
  officialId?: string | null;
  scopeId?: string | null;
  meta?: string | null;
  isMainZone?: boolean;
  center?: Coordinate | null;
  coordinates: Coordinate[];
  holes?: Coordinate[][];
};
type Topic = {
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
type Post = {
  id: string;
  topicId: string;
  topicName?: string;
  author: string;
  mahala: string;
  content: string;
  timeAgo: string;
  votes: number;
  upvotes: number;
  downvotes: number;
  comments: number;
  color: string;
  replies: Array<{
    id: string;
    author: string;
    content: string;
    votes: number;
    comments: number;
  }>;
};
type Page = 'app' | 'privacy' | 'terms' | 'cookies';
type MobileView = 'feed' | 'map' | 'topics' | 'profile';
type LocationStatus = 'idle' | 'locating' | 'granted' | 'denied' | 'unsupported' | 'error';

const DEFAULT_CENTER: [number, number] = [43.8563, 18.4131];
const MOBILE_QUERY = '(max-width: 920px)';
const FEED_SORT_TABS = [
  { id: 'recent', label: 'Najnovije objave' },
  { id: 'popular', label: 'Popularne objave' },
  { id: 'commented', label: 'Najkomentaranije objave' },
] as const;
type FeedSort = typeof FEED_SORT_TABS[number]['id'];
const storeLinks = {
  ios: 'https://apps.apple.com/',
  android: 'https://play.google.com/store',
};
const SARAJEVO_MAHALA_ZONE = {
  id: 'mahala-sarajevo',
  name: 'Sarajevo',
};
const SARAJEVO_TOPIC_SCOPE_ID = 'sarajevo-71000';

function isSafariBrowser() {
  const userAgent = window.navigator.userAgent;
  return /Safari/i.test(userAgent) && !/Chrome|Chromium|CriOS|FxiOS|Edg|OPR|Android/i.test(userAgent);
}

const fallbackTopics: Topic[] = [
  { id: 'sve', name: 'sve', slug: 'sve', count: 0, color: '#8b5cf6', icon: 'chatbubble-ellipses', general: true },
  { id: 'glavna', name: 'glavna', slug: 'glavna', count: 0, description: 'Glavni lokalni tok za sve oko tebe', color: '#7c3aed', icon: 'chatbubble-ellipses', premium: false },
  { id: 'eventi', name: 'eventi', slug: 'eventi', count: 0, description: 'Desavanja, okupljanja, svirke i lokalni dogadjaji', color: '#ec4899', icon: 'calendar', premium: false },
  { id: 'posao', name: 'posao', slug: 'posao', count: 0, description: 'Poslovi, smjene, preporuke i lokalne prilike za rad', color: '#06b6d4', icon: 'briefcase', premium: false },
  { id: 'ljubimci', name: 'ljubimci', slug: 'ljubimci', count: 0, description: 'Ljubimci, parkovi, setnje i komsijske sapice', color: '#84cc16', icon: 'paw', premium: false },
  { id: 'izgubljeno-i-nadjeno', name: 'izgubljeno_i_nadjeno', slug: 'izgubljeno-i-nadjeno', count: 0, description: 'Objave o izgubljenim stvarima, pronalascima i komsijskoj pomoci', color: '#fde047', icon: 'search', premium: false },
  { id: 'politika', name: 'politika', slug: 'politika', count: 0, description: 'Vruce teme, lokalni pritisak i gradske price', color: '#dc2626', icon: 'megaphone', premium: false },
  { id: 'nocna-smjena', name: 'nocna_smjena', slug: 'nocna-smjena', count: 0, description: 'Kasni satovi, nocne dojave i ekipa koja je jos budna', color: '#0b0a10', icon: 'moon', premium: false },
  { id: 'gaming', name: 'gaming', slug: 'gaming', count: 0, description: 'Igre, ekipe, turniri i gejming dogovori', color: '#8b5e34', icon: 'game-controller', premium: false },
  { id: 'sport', name: 'sport', slug: 'sport', count: 0, description: 'Utakmice, treninzi, rekreacija i lokalni sportski razgovori', color: '#ef4444', icon: 'football', premium: false },
  { id: 'prodajem-i-kupujem', name: 'prodajem_i_kupujem', slug: 'prodajem-i-kupujem', count: 0, description: 'Kupovina, prodaja, razmjena i lokalne ponude', color: '#2dd4bf', icon: 'pricetag', premium: true },
  { id: 'dating', name: 'dating', slug: 'dating', count: 0, description: 'Upoznavanje, izlasci i lokalne simpatije', color: '#ec4899', icon: 'heart', premium: true },
];

const fallbackPosts: Post[] = [
  {
    id: 'p1',
    topicId: 'glavna',
    topicName: 'Glavna',
    author: '@mahalac_92',
    mahala: 'Dobrinja',
    content: 'Jutros opet guzva kod kruznog. Ima li iko info kad zavrsavaju radove?',
    timeAgo: 'prije 8 min',
    votes: 126,
    upvotes: 126,
    downvotes: 0,
    comments: 18,
    color: '#8b5cf6',
    replies: [
      {
        id: 'r1',
        author: '@komsija',
        content: 'Tabla kaze do petka, ali realno ovo ide i sljedece sedmice.',
        votes: 49,
        comments: 4,
      },
      {
        id: 'r2',
        author: '@dobrinjac',
        content: 'Najbrze je preko C5 pa nazad prema centru.',
        votes: 31,
        comments: 2,
      },
    ],
  },
  {
    id: 'p2',
    topicId: 'komsiluk',
    topicName: 'Komsiluk',
    author: '@hiperbola_55',
    mahala: 'C5',
    content: 'Ko je ostavio kljuceve kod lifta u trecem ulazu, kod portira su.',
    timeAgo: 'prije 22 min',
    votes: 89,
    upvotes: 89,
    downvotes: 0,
    comments: 11,
    color: '#8b5cf6',
    replies: [
      {
        id: 'r3',
        author: '@kodzica123',
        content: 'Javljam komsinici, mislim da su njeni.',
        votes: 18,
        comments: 1,
      },
    ],
  },
  {
    id: 'p3',
    topicId: 'pitanja',
    topicName: 'Pitanja',
    author: '@sarajka',
    mahala: 'Grbavica',
    content: 'Preporuka za dobrog majstora za bojler? Treba hitno.',
    timeAgo: 'prije 1h',
    votes: 52,
    upvotes: 52,
    downvotes: 0,
    comments: 24,
    color: '#10b981',
    replies: [
      {
        id: 'r4',
        author: '@owl9300',
        content: 'Saljem broj u inbox, covjek je korektan i dodje isti dan.',
        votes: 27,
        comments: 3,
      },
    ],
  },
  {
    id: 'p4',
    topicId: 'desavanja',
    topicName: 'Desavanja',
    author: '@rajvosa',
    mahala: 'Bascarsija',
    content: 'Veceras mali koncert kod Vijecnice, izgleda fino za prosetati.',
    timeAgo: 'prije 2h',
    votes: 203,
    upvotes: 203,
    downvotes: 0,
    comments: 36,
    color: '#f59e0b',
    replies: [],
  },
];
const DEFAULT_PUBLIC_MAHALA_IDS = [
  '10871',
  'sarajevo-71000',
  'user-c5',
  'user-dobrinja',
];

function normalizePath(pathname: string) {
  const normalized = pathname.replace(/\/+$/, '');
  return normalized || '/';
}

function getPageFromPath(pathname = window.location.pathname): Page {
  const path = normalizePath(pathname);

  if (path === '/privacy') {
    return 'privacy';
  }

  if (path === '/terms') {
    return 'terms';
  }

  if (path === '/cookies') {
    return 'cookies';
  }

  return 'app';
}

function getPathForPage(page: Page) {
  if (page === 'app') {
    return '/';
  }

  return `/${page}`;
}

function normalizeCoordinate(value: unknown): Coordinate | null {
  const candidate = value as Coordinate | undefined;
  const latitude = Number(candidate?.latitude);
  const longitude = Number(candidate?.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return { latitude, longitude };
}

function normalizeZone(value: unknown): Zone | null {
  const zone = value as Zone | undefined;
  const coordinates = Array.isArray(zone?.coordinates)
    ? zone.coordinates.map(normalizeCoordinate).filter(Boolean) as Coordinate[]
    : [];

  if (!zone?.id || !zone?.name || coordinates.length < 3) {
    return null;
  }

  return {
    id: String(zone.id),
    name: String(zone.name),
    level: Number(zone.level) || 2,
    officialId: zone.officialId ? String(zone.officialId) : undefined,
    center: normalizeCoordinate(zone.center),
    coordinates,
    holes: Array.isArray(zone.holes)
      ? zone.holes
          .map((ring) => ring.map(normalizeCoordinate).filter(Boolean) as Coordinate[])
          .filter((ring) => ring.length >= 3)
      : [],
  };
}

function normalizePost(value: unknown): Post | null {
  const post = value as Record<string, unknown> | undefined;

  if (!post?.id) {
    return null;
  }

  const score = Number(post.score || 0);
  const upvotes = Number(post.upvotes ?? Math.max(score, 0));
  const downvotes = Number(post.downvotes ?? Math.max(-score, 0));

  return {
    id: `api-post-${post.id}`,
    topicId: post.topic_id ? String(post.topic_id) : 'glavna',
    topicName: post.topic_name ? String(post.topic_name) : undefined,
    author: post.is_anonymous ? 'komsija' : String(post.author_username || 'mahalac'),
    mahala: post.mahala_name ? String(post.mahala_name) : String(post.location || post.mahala_id || 'MAHALA'),
    content: String(post.content || ''),
    timeAgo: String(post.time_ago || post.created_ago || 'sada'),
    votes: score || upvotes - downvotes,
    upvotes,
    downvotes,
    comments: Number(post.comments_count || post.comment_count || 0),
    color: String(post.topic_color || post.color_hex || '#8b5cf6'),
    replies: [],
  };
}

function polygonPath(zone: Zone): [number, number][] {
  return zone.coordinates.map((coordinate) => [
    coordinate.latitude,
    coordinate.longitude,
  ]);
}

function pointInRing(point: Coordinate, polygon: Coordinate[]) {
  let inside = false;
  let j = polygon.length - 1;

  for (let i = 0; i < polygon.length; i += 1) {
    const yi = polygon[i].latitude;
    const xi = polygon[i].longitude;
    const yj = polygon[j].latitude;
    const xj = polygon[j].longitude;
    const intersects = yi > point.latitude !== yj > point.latitude &&
      point.longitude < ((xj - xi) * (point.latitude - yi)) / ((yj - yi) || Number.EPSILON) + xi;

    if (intersects) {
      inside = !inside;
    }

    j = i;
  }

  return inside;
}

function pointInPolygon(point: Coordinate, polygon: Coordinate[], holes: Coordinate[][] = []) {
  if (!pointInRing(point, polygon)) {
    return false;
  }

  return !holes.some((hole) => pointInRing(point, hole));
}

function getCurrentMahalas(coordinate: Coordinate, sarajevoZones: Zone[], userZones: Zone[]) {
  const activeSarajevoArena = getSarajevoArenaForCoordinate(coordinate, sarajevoZones);
  const userMatches = userZones
    .filter((zone) =>
      pointInPolygon(coordinate, zone.coordinates, zone.holes || []) ||
      (activeSarajevoArena && String(zone.id) === SARAJEVO_TOPIC_SCOPE_ID),
    )
    .sort((left, right) => {
      const leftLevel = Number(left.level) === 1 ? 1 : 2;
      const rightLevel = Number(right.level) === 1 ? 1 : 2;

      if (leftLevel !== rightLevel) {
        return leftLevel - rightLevel;
      }

      return String(left.name).localeCompare(String(right.name));
    })
    .map((zone) => ({
      ...zone,
      type: 'userMahala',
      level: Number(zone.level) === 1 ? 1 : 2,
      scopeId: zone.officialId || zone.id,
      meta: `u sklopu ${activeSarajevoArena?.name || SARAJEVO_MAHALA_ZONE.name}`,
      isMainZone: false,
    }));

  const nodes: Zone[] = [];

  if (activeSarajevoArena) {
    nodes.push({
      ...activeSarajevoArena,
      id: SARAJEVO_MAHALA_ZONE.id,
      name: SARAJEVO_MAHALA_ZONE.name,
      type: 'zone',
      level: 0,
      scopeId: SARAJEVO_TOPIC_SCOPE_ID,
      meta: null,
      isMainZone: true,
    });

    nodes.push({
      ...activeSarajevoArena,
      id: `sarajevo-arena:${activeSarajevoArena.id || activeSarajevoArena.name}`,
      name: getSarajevoArenaName(activeSarajevoArena.name),
      sourceId: activeSarajevoArena.id || null,
      type: 'sarajevoArena',
      level: 0,
      scopeId: activeSarajevoArena.id || activeSarajevoArena.officialId || null,
      meta: `u sklopu ${SARAJEVO_MAHALA_ZONE.name}`,
      isMainZone: false,
    });
  }

  return [...nodes, ...userMatches];
}

function getSarajevoArenaName(name: string) {
  if (name === 'Stari Grad Sarajevo') {
    return 'Stari Grad';
  }

  if (name === 'Centar Sarajevo') {
    return 'Centar';
  }

  if (name === 'Novi Grad Sarajevo') {
    return 'Novi Grad';
  }

  return name;
}

function getSarajevoArenaForCoordinate(coordinate: Coordinate, sarajevoZones: Zone[]) {
  return sarajevoZones.find((zone) => pointInPolygon(coordinate, zone.coordinates, zone.holes || [])) || null;
}

function getMahalaApiScopeId(zone: Zone) {
  if (zone.id === SARAJEVO_MAHALA_ZONE.id) {
    return SARAJEVO_TOPIC_SCOPE_ID;
  }

  if (zone.scopeId) {
    return zone.scopeId;
  }

  if (zone.type === 'sarajevoArena') {
    return zone.sourceId || zone.officialId || String(zone.id).replace('sarajevo-arena:', '');
  }

  return zone.officialId || zone.id;
}

function getNearbyMahalaIds(coordinate: Coordinate, sarajevoZones: Zone[], userZones: Zone[]) {
  const matchingIds = getCurrentMahalas(coordinate, sarajevoZones, userZones)
    .map((zone) => String(getMahalaApiScopeId(zone)));

  return matchingIds.length ? matchingIds.slice(0, 10) : DEFAULT_PUBLIC_MAHALA_IDS;
}

function mergeTopicsWithGeneric(apiTopics: Topic[]) {
  const bySlugOrId = new Map<string, Topic>();

  for (const topic of apiTopics) {
    bySlugOrId.set(topic.slug, topic);
    bySlugOrId.set(topic.id, topic);
  }

  const merged = fallbackTopics.map((genericTopic) => {
    const apiTopic = bySlugOrId.get(genericTopic.slug) || bySlugOrId.get(genericTopic.id);

    return {
      ...genericTopic,
      ...(apiTopic || {}),
      id: genericTopic.id,
      name: genericTopic.name,
      slug: genericTopic.slug,
      color: apiTopic?.color || genericTopic.color,
      description: genericTopic.description,
      icon: apiTopic?.icon || genericTopic.icon,
      premium: genericTopic.premium,
      general: genericTopic.general,
      count: Number(apiTopic?.count ?? genericTopic.count ?? 0),
    };
  });

  const genericKeys = new Set(merged.flatMap((topic) => [topic.id, topic.slug]));
  const customTopics = apiTopics.filter((topic) => !genericKeys.has(topic.id) && !genericKeys.has(topic.slug));

  const finalTopics = [...merged, ...customTopics];
  const totalCount = finalTopics
    .filter((topic) => topic.id !== 'sve')
    .reduce((sum, topic) => sum + Number(topic.count || 0), 0);

  return finalTopics.map((topic) => topic.id === 'sve' ? { ...topic, count: totalCount } : topic);
}

function LottieBox({ className }: { className: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }

    const animation = lottie.loadAnimation({
      animationData: mahalaJumpLogo,
      autoplay: true,
      container: containerRef.current,
      loop: true,
      renderer: 'svg',
    });

    return () => animation.destroy();
  }, []);

  return <div className={className} ref={containerRef} />;
}

function FitZone({ zone }: { zone: Zone | null }) {
  const map = useMap();

  useEffect(() => {
    if (!zone) {
      return;
    }

    const bounds = L.latLngBounds(polygonPath(zone));
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.28), { animate: true, maxZoom: 15 });
    }
  }, [map, zone]);

  return null;
}

function UserLottieMarker({ coordinate }: { coordinate: Coordinate | null }) {
  const map = useMap();
  const markerRef = useRef<L.Marker | null>(null);
  const animationRef = useRef<ReturnType<typeof lottie.loadAnimation> | null>(null);

  useEffect(() => {
    if (
      !coordinate ||
      !Number.isFinite(coordinate.latitude) ||
      !Number.isFinite(coordinate.longitude)
    ) {
      markerRef.current?.remove();
      markerRef.current = null;
      animationRef.current?.destroy();
      animationRef.current = null;
      return undefined;
    }

    const position = L.latLng(coordinate.latitude, coordinate.longitude);

    try {
      if (!markerRef.current) {
        const icon = L.divIcon({
          className: 'mahala-user-marker',
          html: '<div class="mahala-user-marker-inner"></div>',
          iconAnchor: [34, 58],
          iconSize: [68, 68],
        });
        markerRef.current = L.marker(position, { icon, interactive: false }).addTo(map);
      } else {
        markerRef.current.setLatLng(position);
      }

      map.setView(position, Math.max(map.getZoom(), 14), { animate: false });
    } catch {
      markerRef.current?.remove();
      markerRef.current = null;
      return undefined;
    }

    const markerElement = markerRef.current.getElement();
    const lottieContainer = markerElement?.querySelector('.mahala-user-marker-inner') as HTMLDivElement | null;

    if (lottieContainer && !animationRef.current) {
      try {
        animationRef.current = lottie.loadAnimation({
          animationData: mahalaJumpLogo,
          autoplay: true,
          container: lottieContainer,
          loop: true,
          renderer: 'svg',
        });
      } catch {
        animationRef.current = null;
      }
    }

    return undefined;
  }, [coordinate, map]);

  useEffect(() => () => {
    markerRef.current?.remove();
    animationRef.current?.destroy();
  }, []);

  return null;
}

function StoreButtons() {
  return (
    <div className="flex items-center gap-2">
      <a className="store-button" href={storeLinks.ios} target="_blank" rel="noreferrer">
        <Download size={15} />
        App Store
      </a>
      <a className="store-button" href={storeLinks.android} target="_blank" rel="noreferrer">
        <Download size={15} />
        Google Play
      </a>
    </div>
  );
}

function Header({
  page,
  onPage,
  selectedZone,
  locationStatus,
  onLocationPress,
}: {
  page: Page;
  onPage: (page: Page) => void;
  selectedZone: Zone | null;
  locationStatus: LocationStatus;
  onLocationPress: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const locationLabel = (() => {
    if (locationStatus === 'locating') {
      return 'Locira';
    }

    if (locationStatus === 'idle') {
      return 'Lokacija';
    }

    if (locationStatus !== 'granted') {
      return 'Lokacije nedostupna';
    }

    return selectedZone?.name || 'Lokacije nedostupna';
  })();
  const menuItems: Array<{ page: Page; label: string }> = [
    { page: 'privacy', label: 'Privatnost' },
    { page: 'terms', label: 'Uslovi' },
    { page: 'cookies', label: 'Kolacici' },
  ];

  return (
    <header className="app-header">
      <button className="brand" type="button" onClick={() => onPage('app')}>
        <img src="/mahala.svg" alt="MAHALA" />
        <span>MAHALA</span>
      </button>
      <button className="header-location-control" type="button" onClick={onLocationPress}>
        <Navigation size={15} />
        <span>{locationLabel}</span>
        <ChevronDown size={16} />
      </button>
      <div className="header-actions">
        <StoreButtons />
        <div className="header-menu-wrap">
          <button
            className="header-icon-button"
            type="button"
            aria-label="Otvori meni"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <Menu size={21} />
          </button>
          {menuOpen ? (
            <nav className="header-menu" aria-label="Pravne stranice">
              {menuItems.map((item) => (
                <button
                  key={item.page}
                  className={page === item.page ? 'active' : ''}
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onPage(item.page);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function FeedSortTabs({
  activeSort,
  onSort,
}: {
  activeSort: FeedSort;
  onSort: (sort: FeedSort) => void;
}) {
  return (
    <div className="feed-tabs" role="tablist" aria-label="Sortiranje objava">
      {FEED_SORT_TABS.map((tab) => (
        <button
          key={tab.id}
          className={activeSort === tab.id ? 'active' : ''}
          type="button"
          role="tab"
          aria-selected={activeSort === tab.id}
          onClick={() => onSort(tab.id)}
        >
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

function PostCard({
  post,
  active,
  onClick,
}: {
  key?: string;
  post: Post;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`post-card ${active ? 'active' : ''}`} onClick={onClick}>
      <span className="avatar" style={{ background: post.color }}>{post.author[1]?.toUpperCase() || 'M'}</span>
      <span className="post-main">
        <span className="post-meta">{post.author} · {post.timeAgo} · {post.mahala}</span>
        <span className="post-content">{post.content}</span>
        <span className="post-stats">
          <span><Heart size={14} /> {post.votes}</span>
          <span><MessageCircle size={14} /> {post.comments}</span>
        </span>
      </span>
    </button>
  );
}

function NativePostCard({
  post,
  active,
  onClick,
}: {
  post: Post;
  active: boolean;
  onClick: () => void;
}) {
  const author = post.author.startsWith('@') ? post.author : `@${post.author}`;

  return (
    <button
      type="button"
      className={`post-card native-post-card ${active ? 'active' : ''}`}
      style={{ backgroundColor: post.color }}
      onClick={onClick}
    >
      <span className="post-meta-row">
        <span>{post.mahala}</span>
        <span>-</span>
        <span>{author}</span>
        <span>-</span>
        <span>{post.timeAgo}</span>
      </span>
      <span className="post-topic-pill">{post.topicName || post.topicId}</span>
      <span className="post-content">{post.content}</span>
      <span className="post-footer">
        <span className="post-action-pill">
          <MessageCircle size={13} />
          {post.comments} komentara
        </span>
        <span className="post-action-pill drot-pill">
          <Bell size={13} />
          Drot
        </span>
      </span>
      <span className="post-vote-rail">
        <span className="vote-badge">
          <ChevronUp size={18} />
          <strong>{post.upvotes}</strong>
        </span>
        <span className="vote-badge">
          <strong>{post.downvotes}</strong>
          <ChevronDown size={18} />
        </span>
      </span>
    </button>
  );
}

function FeedPanel({
  topics,
  activeTopic,
  onTopic,
  activeSort,
  onSort,
  posts,
  selectedPost,
  onPost,
  locationStatus,
  onLocate,
  onOpenLocationSettings,
}: {
  topics: Topic[];
  activeTopic: string;
  onTopic: (id: string) => void;
  activeSort: FeedSort;
  onSort: (sort: FeedSort) => void;
  posts: Post[];
  selectedPost: Post | null;
  onPost: (post: Post) => void;
  locationStatus: LocationStatus;
  onLocate: () => void;
  onOpenLocationSettings: () => void;
}) {
  const needsLocation = locationStatus !== 'granted';
  const locationCopy = (() => {
    if (locationStatus === 'unsupported') {
      return {
        title: 'Lokacija nije dostupna',
        body: window.isSecureContext
          ? 'Browser trenutno ne podrzava lokaciju. Otvori MAHALA web u modernom browseru.'
          : 'Lokacija u browseru radi samo preko HTTPS ili localhost. Na ovoj Not secure adresi browser nece prikazati prompt.',
        action: window.isSecureContext ? 'Pokusaj ponovo' : 'Otvori preko HTTPS',
      };
    }

    if (locationStatus === 'denied') {
      return {
        title: 'Lokacija je blokirana',
        body: 'U Safari postavkama dozvoli lokaciju za ovu stranicu, pa se vrati na MAHALA web.',
        action: 'Otvori Safari postavke',
      };
    }

    if (locationStatus === 'error') {
      return {
        title: 'Lokacija nije ucitana',
        body: 'Nismo mogli procitati tvoju lokaciju. Provjeri browser dozvole i pokusaj ponovo.',
        action: 'Pokusaj ponovo',
      };
    }

    return {
      title: 'Dopustite lokaciju',
      body: 'Dopustite lokaciju za ucitavanje objava i tema iz MAHALA u tvojoj blizini.',
      action: locationStatus === 'locating' ? 'Lociranje...' : 'Dopusti lokaciju',
    };
  })();

  return (
    <aside className="feed-panel">
      <div className="panel-title">
        <div>
          <p>Trenutne MAHALE</p>
          <h1>Sta se desava oko tebe</h1>
        </div>
        <Sparkles size={20} />
      </div>
      {needsLocation ? (
        <div className="feed-empty-state">
          <LottieBox className="feed-empty-lottie" />
          <h2>{locationCopy.title}</h2>
          <p>{locationCopy.body}</p>
          <button type="button" onClick={locationStatus === 'denied' ? onOpenLocationSettings : onLocate}>
            {locationCopy.action}
          </button>
        </div>
      ) : (
        <>
          <FeedSortTabs activeSort={activeSort} onSort={onSort} />
          {posts.length === 0 ? (
            <div className="feed-empty-state compact">
              <LottieBox className="feed-empty-lottie" />
              <h2>Nema objava u blizini</h2>
              <p>Kada se pojave nove objave ili teme u tvojim trenutnim mahalama, prikazat ce se ovdje.</p>
            </div>
          ) : (
            <div className="post-list">
              {posts.map((post) => (
                <PublicPostCard
                  key={post.id}
                  post={post}
                  active={selectedPost?.id === post.id}
                  onClick={() => onPost(post)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </aside>
  );
}

function PostDetail({
  post,
  onBack,
}: {
  post: Post;
  onBack: () => void;
}) {
  return (
    <section className="detail-panel">
      <button type="button" className="back-button" onClick={onBack}>
        <ChevronLeft size={18} />
        Nazad na objave
      </button>
      <article className="detail-card">
        <div className="detail-meta">
          <span className="avatar large" style={{ background: post.color }}>{post.author[1]?.toUpperCase() || 'M'}</span>
          <div>
            <strong>{post.author}</strong>
            <p>{post.mahala} · {post.timeAgo}</p>
          </div>
        </div>
        <p className="detail-content">{post.content}</p>
        <div className="post-stats">
          <span><Heart size={15} /> {post.votes}</span>
          <span><MessageCircle size={15} /> {post.comments}</span>
        </div>
      </article>
      <h2>Komentari {post.comments}</h2>
      <div className="reply-list">
        {(post.replies.length ? post.replies : fallbackPosts[0].replies).map((reply) => (
          <div className="reply-card" key={reply.id}>
            <strong>{reply.author}</strong>
            <p>{reply.content}</p>
            <span><Heart size={14} /> {reply.votes} <MessageCircle size={14} /> {reply.comments}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function TopicPanel({
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
        {topics.filter((topic) => topic.id !== 'sve').map((topic) => (
          <button
            key={topic.id}
            className={activeTopic === topic.id ? 'active' : ''}
            onClick={() => onTopic(topic.id)}
          >
            <Flame size={18} />
            <span>{topic.name}</span>
            <small>{topic.count} objava</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function MahalaMap({
  zones,
  selectedZone,
  userCoordinate,
  onZone,
}: {
  zones: Zone[];
  selectedZone: Zone | null;
  userCoordinate: Coordinate | null;
  onZone: (zone: Zone) => void;
}) {
  return (
    <div className="map-shell">
      <MapContainer center={DEFAULT_CENTER} zoom={12} minZoom={8} className="map-view" zoomControl={false}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {zones.map((zone) => {
          const selected = selectedZone?.id === zone.id;
          const color = Number(zone.level) === 0
            ? '#7c3aed'
            : Number(zone.level) === 1
              ? '#8b5cf6'
              : '#10b981';
          return (
            <Polygon
              key={zone.id}
              positions={polygonPath(zone)}
              pathOptions={{
                color: selected ? '#f8fafc' : color,
                fillColor: color,
                fillOpacity: selected ? 0.4 : 0.16,
                weight: selected ? 3 : 1.4,
              }}
              eventHandlers={{ click: () => onZone(zone) }}
            >
              <Tooltip sticky direction="top">{zone.name}</Tooltip>
            </Polygon>
          );
        })}
        <UserLottieMarker coordinate={userCoordinate} />
        <FitZone zone={selectedZone} />
      </MapContainer>
      <div className="map-badge">
        <Compass size={16} />
        <span>
          {selectedZone?.name || 'Interaktivna mapa mahala'}
          {selectedZone?.name ? <small>Odabrana MAHALA</small> : null}
        </span>
      </div>
    </div>
  );
}

function LegalPage({ page, onBack }: { page: Exclude<Page, 'app'>; onBack: () => void }) {
  const content = {
    privacy: {
      title: 'Politika privatnosti',
      intro: 'Na webu prikazujemo javne podatke i osnovnu analitiku potrebnu za stabilan rad servisa.',
      items: [
        'Lokacija na webu nije potrebna za pregled javne mape.',
        'Ako otvoris store link, Apple ili Google obradjuju podatke prema svojim pravilima.',
        'Podaci iz aplikacije cuvaju se kroz MAHALA backend i koriste za objave, komentare, notifikacije i pro status.',
      ],
    },
    terms: {
      title: 'Uslovi koristenja',
      intro: 'MAHALA web prikazuje javni pregled objava, tema i mapa. Pisanje, glasanje i puni profil dostupni su u native aplikaciji.',
      items: [
        'Sadrzaj se prikazuje informativno i moze kasniti u odnosu na aplikaciju.',
        'Zabranjeno je zloupotrebljavati javni prikaz, scraping i pokusaje zaobilazenja sigurnosti.',
        'MAHALA moze ukloniti sadrzaj koji krsi pravila zajednice ili zakon.',
      ],
    },
    cookies: {
      title: 'Politika kolacica',
      intro: 'Kolacici i slicne tehnologije koriste se da web radi stabilno, da zapamti osnovne postavke i da razumijemo agregirano koristenje stranice.',
      items: [
        'Ne koristimo kolacice za pisanje objava na webu jer je web samo za citanje i navigaciju.',
        'Tehnicki kolacici mogu biti potrebni za sigurnost, performanse i pamcenje osnovnih izbora.',
        'Linkovi prema App Store i Google Play mogu otvoriti servise koji imaju vlastita pravila kolacica.',
      ],
    },
  }[page];

  return (
    <main className="legal-page">
      <button className="back-button" onClick={onBack}>
        <ChevronLeft size={18} />
        Nazad
      </button>
      <section>
        <Shield size={28} />
        <h1>{content.title}</h1>
        <p>{content.intro}</p>
        <div className="legal-list">
          {content.items.map((item) => (
            <article key={item}>
              <span />
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function BottomNav({
  active,
  onChange,
}: {
  active: MobileView;
  onChange: (view: MobileView) => void;
}) {
  const items: Array<{ id: MobileView; label: string; icon: ReactNode }> = [
    { id: 'feed', label: 'Feed', icon: <Home size={19} /> },
    { id: 'topics', label: 'Teme', icon: <Search size={19} /> },
    { id: 'map', label: 'Mapa', icon: <MapPin size={19} /> },
    { id: 'profile', label: 'Preuzmi', icon: <Download size={19} /> },
  ];

  return (
    <nav className="mobile-bottom-nav">
      {items.map((item) => (
        <button key={item.id} className={active === item.id ? 'active' : ''} onClick={() => onChange(item.id)}>
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>(() => getPageFromPath());
  const [mobileView, setMobileView] = useState<MobileView>('map');
  const [zones, setZones] = useState<Zone[]>([]);
  const sarajevoZones = useMemo(
    () => (SARAJEVO_POLYGONS as Zone[]).map((zone) => ({ ...zone, level: 0 })),
    [],
  );
  const [topics, setTopics] = useState<Topic[]>(fallbackTopics);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTopic, setActiveTopic] = useState('sve');
  const [feedSort, setFeedSort] = useState<FeedSort>('recent');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [userCoordinate, setUserCoordinate] = useState<Coordinate | null>(null);
  const [lastLocatedCoordinate, setLastLocatedCoordinate] = useState<Coordinate | null>(null);
  const [currentMahalas, setCurrentMahalas] = useState<Zone[]>([]);
  const [enabledMahalaIds, setEnabledMahalaIds] = useState<Set<string>>(() => new Set());
  const [currentMahalasSheetOpen, setCurrentMahalasSheetOpen] = useState(false);
  const feedRequestIdRef = useRef(0);
  const locationRequestIdRef = useRef(0);
  const mapZones = useMemo(() => [...sarajevoZones, ...zones], [sarajevoZones, zones]);

  const navigateToPage = (nextPage: Page) => {
    const nextPath = getPathForPage(nextPage);

    if (normalizePath(window.location.pathname) !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }

    setPage(nextPage);
  };

  useEffect(() => {
    const handlePopState = () => {
      setPage(getPageFromPath());
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadMapData = async () => {
      let nextZones: Zone[] = [];

      try {
        const response = await fetch(endpoints.mahalas, {
          headers: { Accept: 'application/json' },
        });
        const payload = await response.json().catch(() => null);
        nextZones = Array.isArray(payload?.data)
          ? payload.data.map(normalizeZone).filter(Boolean) as Zone[]
          : [];
      } catch {
        nextZones = [];
      }

      if (cancelled) {
        return;
      }

      setZones(nextZones);
    };

    void loadMapData();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadFeedForMahalaIds = useCallback(async (feedMahalaIds: string[], sort: FeedSort = feedSort) => {
    const requestId = feedRequestIdRef.current + 1;
    feedRequestIdRef.current = requestId;
    const resolvedIds = [...new Set(feedMahalaIds.length ? feedMahalaIds : DEFAULT_PUBLIC_MAHALA_IDS)];

    const [postsResult, topicsResult] = await Promise.allSettled([
      fetch(endpoints.feedForCurrentMahalas(resolvedIds, { limit: 14, sort }), {
        headers: { Accept: 'application/json' },
      }).then((response) => response.json()),
      fetch(endpoints.topicsForCurrentMahalas(resolvedIds), {
        headers: { Accept: 'application/json' },
      }).then((response) => response.json()),
    ]);

    if (requestId !== feedRequestIdRef.current) {
      return;
    }

    if (postsResult.status === 'fulfilled') {
      const nextPosts = Array.isArray(postsResult.value?.data)
        ? postsResult.value.data.map(normalizePost).filter(Boolean) as Post[]
        : [];
      setPosts(nextPosts);
    }

    if (topicsResult.status === 'fulfilled') {
      const nextTopics = Array.isArray(topicsResult.value?.data)
        ? topicsResult.value.data.map((topic: any) => ({
            id: String(topic.id ?? topic.slug ?? topic.name),
            name: String(topic.name ?? topic.slug ?? 'Tema'),
            slug: String(topic.slug ?? topic.id ?? topic.name),
            count: Number(topic.posts_count ?? topic.count ?? 0),
            color: String(topic.color || topic.color_hex || topic.topic_color || '#8b5cf6'),
            description: topic.description ? String(topic.description) : undefined,
            icon: topic.icon ? String(topic.icon) : undefined,
            premium: Boolean(topic.premium),
            general: Boolean(topic.general),
          })) as Topic[]
        : [];

      setTopics(mergeTopicsWithGeneric(nextTopics));
      setActiveTopic('sve');
    }
  }, [feedSort]);

  useEffect(() => {
    void loadFeedForMahalaIds(DEFAULT_PUBLIC_MAHALA_IDS, feedSort);
  }, [loadFeedForMahalaIds]);

  const requestLocation = useCallback(() => {
    const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
    if (!window.isSecureContext && !isLocalhost) {
      setLocationStatus('unsupported');
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }

    const requestId = locationRequestIdRef.current + 1;
    locationRequestIdRef.current = requestId;
    setLocationStatus('locating');

    const handlePosition = (position: GeolocationPosition) => {
      if (requestId !== locationRequestIdRef.current) {
        return;
      }

      const coordinate = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      const nextCurrentMahalas = getCurrentMahalas(coordinate, sarajevoZones, zones);
      const currentZone = nextCurrentMahalas.find((zone) => Number(zone.level) > 0) || nextCurrentMahalas[0];
      setUserCoordinate(coordinate);
      setLastLocatedCoordinate(coordinate);
      setCurrentMahalas(nextCurrentMahalas);
      setEnabledMahalaIds(new Set(nextCurrentMahalas.map((zone) => String(zone.id))));
      setCurrentMahalasSheetOpen(nextCurrentMahalas.length > 0);
      setMobileView('map');
      if (currentZone) {
        setSelectedZone(currentZone);
      }
      setLocationStatus('granted');
      void loadFeedForMahalaIds(nextCurrentMahalas.map((zone) => String(getMahalaApiScopeId(zone))), feedSort);
    };

    const handleError = (error: GeolocationPositionError) => {
      if (requestId !== locationRequestIdRef.current) {
        return;
      }

      setLocationStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'error');
    };

    try {
      navigator.geolocation.getCurrentPosition(handlePosition, handleError, {
        enableHighAccuracy: true,
        maximumAge: 60_000,
        timeout: 12_000,
      });
    } catch {
      setLocationStatus('error');
    }
  }, [feedSort, loadFeedForMahalaIds, sarajevoZones, zones]);

  const toggleCurrentMahala = useCallback((id: string) => {
    setEnabledMahalaIds((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      const enabledIds = currentMahalas
        .filter((zone) => next.has(String(zone.id)))
        .map((zone) => String(getMahalaApiScopeId(zone)));
      void loadFeedForMahalaIds(enabledIds, feedSort);

      return next;
    });
  }, [currentMahalas, feedSort, loadFeedForMahalaIds]);

  const changeFeedSort = useCallback((nextSort: FeedSort) => {
    setFeedSort(nextSort);
    const enabledIds = currentMahalas
      .filter((zone) => enabledMahalaIds.has(String(zone.id)))
      .map((zone) => String(getMahalaApiScopeId(zone)));
    void loadFeedForMahalaIds(enabledIds.length ? enabledIds : DEFAULT_PUBLIC_MAHALA_IDS, nextSort);
  }, [currentMahalas, enabledMahalaIds, loadFeedForMahalaIds]);

  const openLocationSettings = useCallback(() => {
    const candidates = [
      'App-Prefs:SAFARI',
      'prefs:root=SAFARI',
    ];
    const target = candidates[0];
    window.location.href = target;
  }, []);

  useEffect(() => {
    if (sarajevoZones.length === 0 || locationStatus !== 'idle') {
      return undefined;
    }

    if (isSafariBrowser()) {
      return undefined;
    }

    const timeout = window.setTimeout(requestLocation, 450);
    return () => window.clearTimeout(timeout);
  }, [locationStatus, requestLocation, sarajevoZones.length]);

  useEffect(() => {
    if (!lastLocatedCoordinate) {
      return;
    }

    const nextCurrentMahalas = getCurrentMahalas(lastLocatedCoordinate, sarajevoZones, zones);
    const currentZone = nextCurrentMahalas.find((zone) => Number(zone.level) > 0) || nextCurrentMahalas[1] || nextCurrentMahalas[0];
    setCurrentMahalas(nextCurrentMahalas);
    setEnabledMahalaIds((current) => {
      if (current.size > 0) {
        const nextIds = new Set(nextCurrentMahalas.map((zone) => String(zone.id)));
        const merged = new Set<string>();
        nextIds.forEach((id) => {
          if (current.has(id)) {
            merged.add(id);
          }
        });
        return merged.size ? merged : nextIds;
      }

      return new Set(nextCurrentMahalas.map((zone) => String(zone.id)));
    });
    if (currentZone) {
      setSelectedZone(currentZone);
    }
  }, [lastLocatedCoordinate, sarajevoZones, zones]);

  const visiblePosts = useMemo(
    () => {
      const activeTopicMeta = topics.find((topic) => topic.id === activeTopic);
      const acceptedTopicKeys = new Set([
        activeTopic,
        activeTopicMeta?.slug,
        activeTopicMeta?.name,
      ].filter(Boolean).map(String));

      return posts.filter((post) =>
        activeTopic === 'sve' ||
        acceptedTopicKeys.has(String(post.topicId)) ||
        acceptedTopicKeys.has(String(post.topicId).replace(/^@/, '')),
      );
    },
    [activeTopic, posts, topics],
  );

  useEffect(() => {
    if (!selectedZone && mapZones.length > 0) {
      setSelectedZone(mapZones[0]);
    }
  }, [mapZones, selectedZone]);

  const handleLocationPress = useCallback(() => {
    if (locationStatus === 'granted' && currentMahalas.length > 0) {
      setCurrentMahalasSheetOpen(true);
      return;
    }

    requestLocation();
  }, [currentMahalas.length, locationStatus, requestLocation]);

  const appBody = selectedPost ? (
    <PostDetail post={selectedPost} onBack={() => setSelectedPost(null)} />
  ) : (
    <FeedPanel
      topics={topics}
      activeTopic={activeTopic}
      onTopic={(topic) => {
        setActiveTopic(topic);
        setMobileView('feed');
      }}
      activeSort={feedSort}
      onSort={changeFeedSort}
      posts={visiblePosts}
      selectedPost={selectedPost}
      onPost={(post) => setSelectedPost(post)}
      locationStatus={locationStatus}
      onLocate={requestLocation}
      onOpenLocationSettings={openLocationSettings}
    />
  );

  if (page !== 'app') {
    return (
      <div className="app-shell legal-shell">
        <Header page={page} onPage={navigateToPage} selectedZone={selectedZone} locationStatus={locationStatus} onLocationPress={handleLocationPress} />
        <LegalPage page={page} onBack={() => navigateToPage('app')} />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Header page={page} onPage={navigateToPage} selectedZone={selectedZone} locationStatus={locationStatus} onLocationPress={handleLocationPress} />
      <main className="desktop-layout">
        <div className="desktop-left">
          {appBody}
        </div>
        <MahalaMap zones={mapZones} selectedZone={selectedZone} userCoordinate={userCoordinate} onZone={setSelectedZone} />
        <aside className="desktop-right">
          <PublicTopicsPanel topics={topics} activeTopic={activeTopic} onTopic={setActiveTopic} />
        </aside>
      </main>
      <CurrentMahalasSheet
        open={currentMahalasSheetOpen}
        mahalas={currentMahalas}
        enabledIds={enabledMahalaIds}
        onToggle={toggleCurrentMahala}
        onOpenFeed={() => {
          setCurrentMahalasSheetOpen(false);
          setMobileView('feed');
        }}
        onOpenTopics={() => {
          setCurrentMahalasSheetOpen(false);
          setMobileView('topics');
        }}
        onClose={() => setCurrentMahalasSheetOpen(false)}
      />

      <main className="mobile-layout">
        <div className="mobile-scroll">
          {mobileView === 'feed' ? appBody : null}
          {mobileView === 'map' ? <MahalaMap zones={mapZones} selectedZone={selectedZone} userCoordinate={userCoordinate} onZone={setSelectedZone} /> : null}
          {mobileView === 'topics' ? <PublicTopicsPanel topics={topics} activeTopic={activeTopic} onTopic={(topic) => { setActiveTopic(topic); setMobileView('feed'); }} /> : null}
          {mobileView === 'profile' ? (
            <section className="mobile-app-card download-screen">
              <span className="download-screen-icon">
                <Smartphone size={34} />
              </span>
              <h1>MAHALA aplikacija</h1>
              <p>Preuzmi native aplikaciju za objave, glasanje, notifikacije, Pro teme i punu MAHALA mapu.</p>
              <div className="download-screen-highlights">
                <span>Lokacija uzivo</span>
                <span>Teme iz mahale</span>
                <span>Brze notifikacije</span>
              </div>
              <StoreButtons />
            </section>
          ) : null}
        </div>
        <BottomNav active={mobileView} onChange={setMobileView} />
      </main>
    </div>
  );
}

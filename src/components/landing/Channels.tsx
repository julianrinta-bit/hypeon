'use client';
import { useState, useEffect, useRef } from 'react';
import RevealOnScroll from '@/components/ui/RevealOnScroll';
import { useDragScroll } from '@/hooks/useDragScroll';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import type { ChannelData } from '@/app/api/channels/route';

// Fallback seed data used while fetching or on error
// Order matches API route — FireSpike first, alternated to avoid adjacent yellow banners
const SEED_CHANNELS = [
  { name: 'Fire Spike!', handle: '@firespikeoriginal', channelId: 'UCkIrwXDtY_BSkqBKXCG_uSw', avatar: '', banner: '', subs: '1.14M', fallback: true },
  { name: 'BRIGHT SIDE', handle: '@BrightSideOfficial', channelId: 'UC4rlAVgAK0SGk-yTfe48Qpw', avatar: '', banner: '', subs: '44.6M', fallback: true },
  { name: 'Crafty Panda', handle: '@CraftyPandaOfficial', channelId: 'UC03RvJoIhm_fMwlUpm9ZvFw', avatar: '', banner: '', subs: '19M', fallback: true },
  { name: 'GENIAL', handle: '@genialbrightsidespanish', channelId: 'UCbrd1vu4_7qIE6IPV_dA-OA', avatar: '', banner: '', subs: '32M', fallback: true },
  { name: 'Blippi', handle: '@blippi', channelId: 'UC5PYHgAzJ1wLEidB58SK6Xw', avatar: '', banner: '', subs: '27.2M', fallback: true },
  { name: 'INCRÍVEL', handle: '@Incrivel', channelId: 'UCIQPHl1WKKTt9KkWyo_JNig', avatar: '', banner: '', subs: '18.4M', fallback: true },
  { name: 'IDEAS EN 5 MINUTOS', handle: '@Ideasen5minutos', channelId: 'UC_OLtzRJdg0MJfiqGWAAIHw', avatar: '', banner: '', subs: '16.6M', fallback: true },
  { name: 'Gotcha!', handle: '@Gotcha_official', channelId: 'UCtxqQnLgj-1rAVtjpSgPS5A', avatar: '', banner: '', subs: '4.24M', fallback: true },
  { name: 'SYMPA', handle: '@symaborni', channelId: 'UCt6IQpsggvn6zmalhPglSEA', avatar: '', banner: '', subs: '7.55M', fallback: true },
  { name: 'BRICO SYMPA', handle: '@BricoSympa', channelId: 'UC9TJezP2M1ADmUYVl8hrQ2A', avatar: '', banner: '', subs: '5.68M', fallback: true },
  { name: 'Bamboo!', handle: '@bamboo.adventures', channelId: 'UCumQ4bX4wm-JtH9BM9MBjlA', avatar: '', banner: '', subs: '340K', fallback: true },
] as ChannelData[];

function ChannelCard({ channel, loading }: { channel: ChannelData; loading: boolean }) {
  if (loading) {
    return (
      <div className="chcard chcard--loading" aria-busy="true">
        <div className="chcard-banner skeleton" />
        <div className="chcard-body">
          <div className="chcard-avatar skeleton" />
          <div className="chcard-lines">
            <div className="skeleton-line" style={{ width: '70%' }} />
            <div className="skeleton-line" style={{ width: '45%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <a
      href={`https://youtube.com/${channel.handle}`}
      target="_blank"
      rel="noopener noreferrer"
      className="chcard"
      aria-label={`${channel.name} — ${channel.subs} subscribers`}
    >
      <div className="chcard-banner">
        {channel.banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={channel.banner} alt="" loading="lazy" />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--web-surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, color: 'var(--accent)', opacity: 0.3 }}>{channel.name[0]}</span>
          </div>
        )}
        <div className="chcard-subs">{channel.subs} subs</div>
      </div>
      <div className="chcard-body">
        {channel.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="chcard-avatar" src={channel.avatar} alt="" loading="lazy" />
        ) : (
          <div className="chcard-avatar" style={{ background: 'var(--accent)', display: 'grid', placeItems: 'center', color: '#0A0A0C', fontWeight: 800, fontSize: 18 }}>
            {channel.name[0]}
          </div>
        )}
        <div className="chcard-lines">
          <div className="chcard-name">{channel.name}</div>
          <div className="chcard-handle">{channel.handle}</div>
        </div>
      </div>
    </a>
  );
}

export default function Channels() {
  const [channels, setChannels] = useState<ChannelData[]>(SEED_CHANNELS);
  const [loading, setLoading] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);
  useDragScroll(trackRef);
  useAutoScroll(trackRef, 0.6);

  useEffect(() => {
    fetch('/api/channels')
      .then(r => r.json())
      .then((data: ChannelData[]) => {
        setChannels(data);
        setLoading(false);
      })
      .catch(() => {
        // Keep seed data on error
        setLoading(false);
      });
  }, []);

  return (
    <section className="section channels-section" id="channels">
      <div className="container">
        <RevealOnScroll>
          <p className="eyebrow"><span>01</span> — Where our talent comes from</p>
          <h2 className="section-title">The talent that built the biggest channels on the internet.</h2>
          <p className="section-subtitle">
            The people who built channels like these — editors, strategists, designers, producers — now run as a single, full-service crew. One team, every discipline, end to end.
          </p>
        </RevealOnScroll>
      </div>

      <div
        className="carousel-track channels-track"
        ref={trackRef}
        style={{ marginTop: 48 }}
        aria-label="Channel showcase"
      >
        {channels.map((ch) => (
          <ChannelCard key={ch.handle} channel={ch} loading={loading} />
        ))}
      </div>
    </section>
  );
}

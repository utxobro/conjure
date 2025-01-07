'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { apiService } from '../services/api';

interface Site {
  siteId: string;
  name: string;
  createdAt: string;
}

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

const SiteListItem = ({ site, showSeparator }: { site: Site; showSeparator: boolean }) => (
  <>
    <Link 
      href={`/sites/${site.siteId}`} 
      className="mx-6 inline-flex items-center group/item hover:scale-105 transition-transform duration-200"
    >
      <span className="text-[#00b8ff] font-mono text-sm mr-2">
        [{formatTime(site.createdAt)}]
      </span>
      <span className="text-[#00ff9d] font-semibold">
        {site.name}
      </span>
      <span className="ml-2 text-white opacity-0 group-hover/item:opacity-100 transform group-hover/item:translate-x-1 transition-all">
        →
      </span>
    </Link>

    {showSeparator && (
      <span className="mx-4 text-[#ff00d4] opacity-30">⬡</span>
    )}
  </>
);

const SiteList = ({ sites = [] }: { sites: Site[] }) => {
  const validSites = (sites || []).filter(
    (site): site is Site => 
      site !== null && 
      site !== undefined && 
      typeof site === 'object' && 
      'siteId' in site && 
      'name' in site && 
      'createdAt' in site
  );

  return (
    <div className="inline-flex whitespace-nowrap">
      {validSites.map((site, index) => (
        <SiteListItem 
          key={`${site.siteId}-${index}`}
          site={site}
          showSeparator={index < validSites.length - 1}
        />
      ))}
    </div>
  );
};

export default function RecentSitesBanner() {
  const [recentSites, setRecentSites] = useState<Site[]>([]);
  const FETCH_INTERVAL = 40000; // 40 seconds
  const marqueeRef = useRef<HTMLDivElement>(null);
  const [animationDuration, setAnimationDuration] = useState<number>(30); // default 30s

  const fetchRecentSites = async () => {
    try {
      const response = await apiService.getRecentSites();

      const validSites = (response.sites || []).filter(
        (site: unknown): site is Site => 
          site !== null && 
          site !== undefined && 
          typeof site === 'object' && 
          'siteId' in site && 
          'name' in site && 
          'createdAt' in site && 
          'url' in site
      );

      const sortedSites = [...validSites]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20); // Keep top 20 most recent sites

      setRecentSites(sortedSites);
    } catch (error) {
      console.error('Failed to load recent sites:', error);
    }
  };

  useEffect(() => {
    fetchRecentSites();
    const interval = setInterval(fetchRecentSites, FETCH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (marqueeRef.current) {
      const contentWidth = marqueeRef.current.scrollWidth / 2;
      const speed = 10; // pixels per second
      const duration = contentWidth / speed;
      setAnimationDuration(duration);
    }
  }, [recentSites]);

  return (
    <div className="w-full h-8 overflow-hidden bg-black relative group">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 matrix-grid opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00ff9d]/10 via-[#00b8ff]/10 to-[#ff00d4]/10" />
      </div>

      {/* Content - Duplicate SiteList for seamless loop */}
      <div
        ref={marqueeRef}
        className="flex whitespace-nowrap  py-1 animate-marquee"
        style={{ animationDuration: `${animationDuration}s` }}
      >
        <SiteList sites={recentSites} />
        <SiteList sites={recentSites} />
      </div>
      
      {/* Gradient Overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent" />

      {/* Top and Bottom Borders with Glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ff9d] to-transparent opacity-30" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ff9d] to-transparent opacity-30" />
    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiService } from '@/services/api';
import AppLayout from '@/components/AppLayout';
import Browser from '@/components/Browser';
import SiteMetadata from '@/components/SiteMetadata';
import SiteStructure from '@/components/SiteStructure';

export default function SitePreview() {
  const params = useParams();
  const [site, setSite] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState<string>('');
  const [currentHtml, setCurrentHtml] = useState<string>('');

  useEffect(() => {
    loadSite();
  }, []);

  const loadSite = async () => {
    try {
      setIsLoading(true);
      const siteData = await apiService.getSite(params.siteId as string);
      setSite(siteData);
      
      // Set initial page
      if (siteData.pages?.length > 0) {
        const initialPage = siteData.pages[0];
        setCurrentPage(initialPage.path);
        setCurrentHtml(initialPage.html);
      }
    } catch (err) {
      setError('Failed to load site');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageSelect = (path: string) => {
    const selectedPage = site.pages.find((p: any) => p.path === path);
    if (selectedPage) {
      setCurrentPage(path);
      setCurrentHtml(selectedPage.html);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="animate-pulse space-y-8">
              <div className="h-12 bg-cyber-blue/10 rounded-lg" />
              <div className="h-96 bg-cyber-blue/10 rounded-lg" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !site) {
    return (
      <AppLayout>
        <div className="min-h-screen p-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg">
              {error || 'Site not found'}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink text-transparent bg-clip-text">
              {site.name}
            </h1>
            <p className="text-xl text-gray-400">
              {site.description}
            </p>
          </div>

          {/* Metadata */}
          <SiteMetadata metadata={site} />

          {/* Preview Area */}
          <div className={`grid ${site.agentType === 'gamedev' ? 'grid-cols-1' : 'grid-cols-4'} gap-6`}>
            {/* Site Structure - Only show for webapps */}
            {site.agentType === 'webapp' && (
              <div className="col-span-1">
                <SiteStructure
                  pages={site.pages.map((p: any) => ({
                    ...p,
                    isActive: p.path === currentPage
                  }))}
                  currentPage={currentPage}
                  onPageSelect={handlePageSelect}
                />
              </div>
            )}

            {/* Browser Preview */}
            <div className={`${site.agentType === 'gamedev' ? 'col-span-1' : 'col-span-3'} h-[800px] bg-terminal-black border border-cyber-blue/30 rounded-lg overflow-hidden`}>
              <Browser
                html={currentHtml}
                pages={site.pages}
                isPreviewMode={true}
                siteUrl={site.url}
                agentType={site.agentType}
              />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 
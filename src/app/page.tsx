import React from 'react';
import LandingHeader from '@/components/layout/LandingHeader';
import EphemeralDiscovery from '@/components/landing/EphemeralDiscovery';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 antialiased selection:bg-blue-600 selection:text-white light:bg-zinc-50 light:text-zinc-900 transition-colors">
      <LandingHeader />
      <main className="flex-1 flex flex-col">
        <EphemeralDiscovery />
      </main>
    </div>
  );
}

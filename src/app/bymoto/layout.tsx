import React from 'react';
import Header from '@/components/layout/Header';

export default function ByMotoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="flex-1 flex flex-col pb-16 md:pb-0">{children}</div>
    </>
  );
}

'use client';
import dynamic from 'next/dynamic';
const CpuGame = dynamic(() => import('@/components/cpu-game'), { ssr: false });
export default function Home() { return <CpuGame />; }

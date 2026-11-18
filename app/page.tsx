'use client';
import dynamic from 'next/dynamic';
const GpuGame = dynamic(() => import('@/components/gpu-game'), { ssr: false });
export default function Home() { return <GpuGame />; }

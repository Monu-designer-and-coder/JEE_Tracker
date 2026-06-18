// * ============================================================================
// * ENHANCED DASHBOARD LAYOUT COMPONENT
// * Modern layout with glass morphism effects and improved accessibility
// * ============================================================================

import { SyllabusAppSidebar } from '@/components/syllabus-app-sidebar';
import { cn } from '@/lib/utils';
import { JSX, ReactNode } from 'react';

// * ============================================================================
// * INTERFACES & TYPES
// * ============================================================================

/**
 * Enhanced layout props interface with better typing
 * @description Props interface for the dashboard layout component
 */
interface EnhancedDashboardLayoutProps {
	/** Child components to render within the layout */
	children: ReactNode;
	/** Optional className for additional styling */
	className?: string;
}

// * ============================================================================
// * ENHANCED DASHBOARD LAYOUT COMPONENT
// * ============================================================================

/**
 * Enhanced Dashboard Layout Component with Modern UI/UX
 * @description Main layout wrapper with sidebar integration and glass morphism effects
 * @param {EnhancedDashboardLayoutProps} props - Component props
 * @returns {JSX.Element} Enhanced layout component
 */

export default function Layout({
	children,
	className = '',
}: EnhancedDashboardLayoutProps): JSX.Element {
	return (
		<div className='h-full relative overflow-hidden'>
			{/* Global Background with Gradient Effects */}
			<div className='fixed inset-0 -z-20'>
				{/* Primary gradient background */}
				<div className='absolute inset-0 bg-linear-to-br from-slate-50 via-emerald-50 to-green-50 dark:from-neutral-950 dark:via-emerald-950/20 dark:to-green-950/20' />

				{/* Animated background orbs for visual depth */}
				<div className='absolute top-0 left-0 w-96 h-96 bg-linear-to-r from-emerald-400/10 to-green-400/10 rounded-full blur-3xl animate-pulse opacity-60' />
				<div className='absolute bottom-0 right-0 w-lg h-128 bg-linear-to-l from-purple-400/8 to-pink-400/8 rounded-full blur-3xl animate-pulse delay-1000 opacity-60' />
				<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-md h-112 bg-linear-to-r from-green-400/6 to-emerald-400/6 rounded-full blur-2xl animate-pulse delay-2000 opacity-50' />
			</div>

			<main
				className={cn(
					'mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-4xl border border-neutral-200 bg-gray-100 md:flex-row dark:border-neutral-700 dark:bg-neutral-800',
					'h-full',
					className,
				)}>
				<SyllabusAppSidebar />
				{children}
			</main>
		</div>
	);
}

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


export default function Layout({
	children,
}: EnhancedDashboardLayoutProps): JSX.Element {
	return (
		<section className='h-full relative w-full'>
			<main
				className={cn(
					'mx-auto w-[95%] h-full border rounded-4xl border-primary/70 bg-primary/5 overflow-scroll no-scrollbar',
				)}>
				{children}
			</main>
		</section>
	);
}

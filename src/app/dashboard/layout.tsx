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
					'mx-auto w-[95%] my-1 h-[93vh] border rounded-4xl border-primary/70 bg-background',
				)}>
				{children}
			</main>
		</section>
	);
}

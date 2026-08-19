'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { JSX, ReactNode } from 'react';

// * ============================================================================
// * INTERFACES & TYPES
// * ============================================================================

/**
 * Enhanced layout props interface with better typing
 * @description Props interface for the dashboard layout component
 */
interface iDashboardLayoutProps {
	/** Child components to render within the layout */
	children: ReactNode;
	sidebar: ReactNode;
}

// * ============================================================================
// * ENHANCED DASHBOARD LAYOUT COMPONENT
// * ============================================================================

export default function Layout({
	children,
	sidebar,
}: iDashboardLayoutProps): JSX.Element {
	return (
		<TooltipProvider>
			<div className='h-full w-full'>
				<SidebarProvider defaultOpen={false}>
					{sidebar}
					<SidebarInset
						className={cn(
							'mx-auto w-[95%] my-1 h-[93vh] lg:border rounded-4xl border-primary/70',
						)}>
						{children}
					</SidebarInset>
				</SidebarProvider>
			</div>
		</TooltipProvider>
	);
}

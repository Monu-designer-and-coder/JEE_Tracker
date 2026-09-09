// components/ui/radial-progress.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface RadialProgressProps {
	/** Progress value — can exceed 100 (e.g. for an "overachieved" state), it's clamped internally for the visual arc */
	value: number;
	/** Ring thickness, expressed in viewBox units (viewBox is 0-100, so this doubles as a rough % of the ring's size) */
	strokeWidth?: number;
	/** Classes for the background/empty track ring */
	trackClassName?: string;
	/** Classes for the filled arc — pass a `text-*` color class here, since the arc uses `stroke-current` */
	indicatorClassName?: string;
	/** Classes for the outer wrapper (use this to control overall size, e.g. `w-[70%] aspect-square`) */
	className?: string;
	/** Centered content, e.g. your circular Button */
	children?: React.ReactNode;
}

function RadialProgress({
	value,
	strokeWidth = 4,
	trackClassName,
	indicatorClassName,
	className,
	children,
}: RadialProgressProps) {
	// Clamp so the arc never visually overdraws past a full circle,
	// even though `value` itself (used for color logic elsewhere) can exceed 100
	const clampedValue = Math.min(Math.max(value, 0), 100);

	// viewBox is 0-100 units — radius is pulled in by half the stroke width
	// so the stroke doesn't get clipped at the SVG's edge
	const radius = 50 - strokeWidth / 2;
	const circumference = 2 * Math.PI * radius;

	// How much of the circle's outline to "hide" to represent the remaining %
	const dashOffset = circumference - (clampedValue / 100) * circumference;

	return (
		<div data-slot='radial-progress' className={cn('relative', className)}>
			{/* -rotate-90 so the arc starts at 12 o'clock instead of 3 o'clock */}
			<svg
				viewBox='0 0 100 100'
				className='absolute inset-0 h-full w-full -rotate-90'>
				{/* Track: the full, dim background ring */}
				<circle
					cx='50'
					cy='50'
					r={radius}
					fill='none'
					strokeWidth={strokeWidth}
					className={cn('stroke-primary/10', trackClassName)}
				/>
				{/* Indicator: the actual progress arc, drawn via stroke-dasharray/offset */}
				<circle
					cx='50'
					cy='50'
					r={radius}
					fill='none'
					strokeWidth={strokeWidth}
					strokeLinecap='round'
					strokeDasharray={circumference}
					strokeDashoffset={dashOffset}
					// stroke-current reads the CSS `color` property — which is exactly
					// what Tailwind's `text-*` classes set, so any `text-*` class works here
					className={cn(
						'stroke-current transition-all duration-700 ease-out',
						indicatorClassName,
					)}
				/>
			</svg>

			{/* Centered content sits on top of the ring, inset so it doesn't overlap the stroke */}
			<div
				className='absolute inset-0 flex items-center justify-center'
				style={{ padding: `${strokeWidth + 4}%` }}>
				{children}
			</div>
		</div>
	);
}

export { RadialProgress };

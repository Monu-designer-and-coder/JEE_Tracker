'use client';

import * as React from 'react';
import { cn } from 'cn';
import { Progress as ProgressPrimitive } from 'radix-ui';
import {
	getColorsClassAsPerPercentage,
	getDynamicGradientStyle,
} from '@/lib/helpers';

function Progress({
	className,
	value,
	...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
	return (
		<ProgressPrimitive.Root
			data-slot='progress'
			className={cn(
				'relative flex h-2 w-full items-center overflow-x-hidden rounded-4xl bg-transparent border-muted',
				className,
			)}
			{...props}>
			<ProgressPrimitive.Indicator
				data-slot='progress-indicator'
				className={cn(
					'size-full flex-1 transition-all',
					getColorsClassAsPerPercentage(),
				)}
				style={{
					transform: `translateX(-${100 - (value || 0)}%)`,
					...getDynamicGradientStyle(Number(value)),
				}}
			/>
		</ProgressPrimitive.Root>
	);
}

export { Progress };

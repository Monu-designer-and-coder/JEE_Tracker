import { getReferenceGradientProps } from '@/lib/helpers';
import { cn } from '@/lib/utils';

export default function MilestoneColorLegend({
	className,
}: {
	className?: string;
}) {
	const gradient = getReferenceGradientProps();

	return (
		<div className={cn(className, 'w-full p-4')}>
			<h3 className='mb-4 text-sm font-bold text-(--color-foreground)'>
				Status Legend
			</h3>

			{/* The Gradient Div */}
			<div
				style={gradient.style}
				className={`h-4 w-full rounded-full shadow-inner ${gradient.className}`}
			/>

			{/* Percentage Markers */}
			<div className='relative w-full h-6 mt-2 text-xs font-medium text-(--color-foreground) opacity-70'>
				<span className='absolute left-0 -translate-x-1/2'>0%</span>
				<span className='absolute left-[50%] -translate-x-1/2'>50%</span>
				<span className='absolute left-[70%] -translate-x-1/2'>70%</span>
				<span className='absolute left-[90%] -translate-x-1/2'>90%</span>
				<span className='absolute left-full -translate-x-1/2'>100%</span>
			</div>
		</div>
	);
}

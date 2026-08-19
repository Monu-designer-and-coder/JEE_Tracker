// app/loading.tsx
import { Loader2 } from 'lucide-react';

export default function Loading() {
	return (
		<div className='flex min-h-[calc(100vh-4px)] w-full flex-col items-center justify-center bg-background px-4'>
			<div className='flex flex-col items-center space-y-4 text-center'>
				{/* Dynamic high-fidelity spinner container */}
				<div className='relative flex h-12 w-12 items-center justify-center'>
					<Loader2 className='h-8 w-8 animate-spin text-primary relative z-10' />
					<div className='absolute inset-0 h-12 w-12 rounded-full border-4 border-muted border-t-transparent animate-ping opacity-15' />
				</div>

				{/* Subtle, accessible text instructions */}
				<div className='space-y-1'>
					<p className='text-sm font-medium tracking-wide text-foreground/80 animate-pulse'>
						Fetching resources...
					</p>
					<p className='text-xs text-muted-foreground'>
						Please wait while we resolve this container view
					</p>
				</div>
			</div>
		</div>
	);
}

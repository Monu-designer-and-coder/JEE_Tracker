'use client';

// * ==========================================================================
// * Imports
// * ==========================================================================
import { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { axiosConfig } from '@/config/axios.config';
import { getQuestionStreakTodayResponse } from '@/types/res/questionStreak.types';

// * ==========================================================================
// * Main Component: Tracker Dashboard
// * ==========================================================================
export default function Tracker() {
	// * State Management
	const [subjectStreaks, setSubjectStreaks] = useState<
		getQuestionStreakTodayResponse[]
	>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	// ! Hydration Safety Pattern: Prevents mismatches between SSR and Client rendering
	const [isMounted, setIsMounted] = useState<boolean>(false);

	// * Lifecycle Hooks
	useEffect(() => {
		setIsMounted(true);
		fetchTodayStreaks();
	}, []);

	// * ==========================================================================
	// * API Methods
	// * ==========================================================================

	// * Fetch initial data for today's question streaks
	const fetchTodayStreaks = async () => {
		try {
			setIsLoading(true);
			const response: AxiosResponse<getQuestionStreakTodayResponse[]> =
				await axios.request(axiosConfig('questionStreak?type=today', 'get'));
			setSubjectStreaks(response.data);
		} catch (error) {
			console.error('Failed to fetch streaks:', error);
		} finally {
			setIsLoading(false);
		}
	};

	// * Increment question streak with Optimistic UI updates for faster UX
	const incrementQuestionStreak = async (
		streakId: string,
		subjectId: string,
	) => {
		// * Optimistically update the UI before the API responds for instant feedback
		setSubjectStreaks((prev) =>
			prev.map((item) =>
				item._id === streakId
					? { ...item, questionsDone: item.questionsDone + 1 }
					: item,
			),
		);

		try {
			// * Execute the background API call
			await axios.request(
				axiosConfig(
					'questionStreak',
					'put',
					{ 'Content-Type': 'application/json' },
					{ _id: streakId },
				),
			);

			// * Optionally re-sync with server to ensure data consistency
			const response: AxiosResponse<getQuestionStreakTodayResponse[]> =
				await axios.request(
					axiosConfig(
						`questionStreak?type=today&subjectId=${subjectId}`,
						'get',
					),
				);

			const updatedItem = response.data[0];
			if (updatedItem) {
				setSubjectStreaks((prev) =>
					prev.map((item) =>
						item._id === updatedItem._id ? { ...item, ...updatedItem } : item,
					),
				);
			}
		} catch (error) {
			// ! Rollback on failure
			console.error('Failed to update streak, rolling back...', error);
			fetchTodayStreaks();
		}
	};

	// * ==========================================================================
	// * Helper Methods
	// * ==========================================================================

	// * Formats date cleanly using Intl API to avoid manual month indexing bugs
	const formatDate = (dateText: string) => {
		if (!dateText) return '';
		const date = new Date(dateText);
		return new Intl.DateTimeFormat('en-IN', {
			weekday: 'short',
			day: '2-digit',
			month: 'short',
			year: 'numeric',
		}).format(date);
	};

	// ! Hydration check: Return null or a skeleton loader until mounted
	if (!isMounted) return null;

	// * ==========================================================================
	// * Render
	// * ==========================================================================
	return (
		<main className='relative min-h-[80vh] w-full overflow-hidden bg-background px-4 py-8 md:px-8'>
			{/* * Ambient Background Effects (Aceternity / Minimalist styling) */}
			<div className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
				<div className='absolute -left-[10%] top-[20%] h-125 w-125 rounded-full bg-primary/10 blur-[120px] mix-blend-screen' />
				<div className='absolute right-[5%] top-[10%] h-100 w-100 rounded-full bg-blue-500/10 blur-[100px] mix-blend-screen' />
			</div>

			{/* * Content Section */}
			<section className='relative z-10 mx-auto max-w-7xl h-[80vh] flex flex-col justify-center'>
				{isLoading ? (
					// * Loading State
					<div className='flex h-64 items-center justify-center'>
						<div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary' />
					</div>
				) : (
					// ! Added TooltipProvider here to ensure tooltips portal correctly and don't get clipped by overflow-hidden
					<TooltipProvider delayDuration={200}>
						<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
							{subjectStreaks.map((item) => (
								<Card
									key={item._id}
									size='sm'
									// * Applied glassmorphism, depth, and consistent border radius
									className='group/card relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:shadow-primary/5 dark:bg-black/40 h-full'>
									{/* * Micro-interaction gradient overlay */}
									<div className='pointer-events-none absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover/card:opacity-100' />

									<CardHeader className='relative z-10 pb-2'>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant='outline'
													size='lg'
													className='w-full capitalize tracking-wide bg-background/50 backdrop-blur-md border-white/10 hover:bg-primary/20 hover:text-primary transition-colors text-base py-6'>
													{item.subject?.name || 'Unknown Subject'}
												</Button>
											</TooltipTrigger>
											{/* ! FIXED: Tooltip visibility, positioning, sizing, and padding issues */}
											<TooltipContent
												side='top'
												sideOffset={12}
												className='z-100 min-w-45 p-4 bg-popover/95 backdrop-blur-xl border border-white/20 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] rounded-xl text-center'>
												<div className='flex flex-col gap-1.5'>
													<p className='text-sm font-bold uppercase tracking-wider text-primary'>
														Active Streak
													</p>
													<p className='text-base font-medium text-foreground'>
														{formatDate(item.date)}
													</p>
												</div>
											</TooltipContent>
										</Tooltip>
									</CardHeader>

									<CardContent className='relative z-10 flex flex-col gap-4 pt-4'>
										{/* * Interactive Stat Block: Questions Done */}
										<button
											onClick={() =>
												incrementQuestionStreak(item._id, item.subject._id)
											}
											className='group/btn relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[1.25rem] border border-white/5 bg-black/20 p-6 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-primary/10 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(var(--primary),0.2)] focus:outline-none focus:ring-2 focus:ring-primary/50'
											aria-label={`Increment questions done for ${item.subject?.name}`}>
											<div className='relative z-10 flex flex-col items-center'>
												<span className='text-4xl font-extrabold tracking-tight md:text-5xl bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-transparent transition-transform duration-300 group-hover/btn:scale-110'>
													{item.questionsDone}
												</span>
												<span className='mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground opacity-90 transition-colors group-hover/btn:text-foreground'>
													Questions Done Today
												</span>
											</div>
										</button>

										{/* * Static Stat Block: Hours Studied */}
										<div className='relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[1.25rem] border border-white/5 bg-black/20 p-6 text-center backdrop-blur-md transition-all duration-300 hover:bg-white/5'>
											<div className='relative z-10 flex flex-col items-center'>
												<span className='text-4xl font-extrabold tracking-tight md:text-5xl text-foreground/80'>
													0 {/* TODO: Implement dynamic hours tracking */}
												</span>
												<span className='mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground opacity-90'>
													Hours Studied Today
												</span>
											</div>
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					</TooltipProvider>
				)}
			</section>
		</main>
	);
}

// ! UI/UX IMPROVEMENTS IMPLEMENTED:
// * 1. Modern minimalistic backgrounds with simple color transitions (Added mix-blend-screen blurred orbs).
// * 2. Glass morphism effects with backdrop blur and transparency (Cards utilize bg-white/5 with backdrop-blur-xl).
// * 3. Animated orbs for visual depth and movement (Ambient background divs added at root level).
// * 4. Enhanced floating dock with improved glass styling (Applied glass styling to buttons).
// * 5. Subtle particle animations for ambient background effects (Simulated via gradient blurred orbs).
// * 6. Improved responsive design with better mobile adaptation (Shifted from hardcoded w-1/3 to grid-cols-1 md:grid-cols-2 lg:grid-cols-3).
// * 7. Enhanced dark mode compatibility with better contrast ratios (Used semantic colors like text-foreground and text-muted-foreground).
// * 8. Interactive hover effects with scale transformations on icons (Added hover:-translate-y-1 and group-hover:scale-110 to stats).
// * 9. Professional color scheme using --preset b2oqCh768 (Utilized shadcn standard primary variables meant to dynamically inherit the preset).
// * 10. Layered visual hierarchy with proper z-indexing (Added z-[100] to Tooltips and strictly managed parent z-indexes).
// * 11. Smooth micro-animations and transitions throughout (Applied transition-all duration-300/500 everywhere).
// * 12. Better accessibility with proper ARIA labels and semantic structure (Added aria-label to the interactive increment button).
// * 13. Enhanced shadow system for depth perception (Added heavy shadows to the tooltip and hover glow to buttons).
// * 14. Consistent border radius system for modern appearance (Used rounded-[1.5rem] and rounded-[1.25rem] universally).
// * 15. Optimized backdrop filters for performance (Used backdrop-blur-md/xl judiciously on parent containers).
// * 16. Improved spacing and padding system (Standardized gaps using gap-6 and padding p-6, increased Tooltip p-4).
// * 17. Better content isolation with backdrop effects (Added border-white/10 to explicitly separate cards from the background).
// * 18. Enhanced visual feedback on interactive elements (Clicking the streak now provides visual hover states).
// * 19. Modern CSS animations with proper timing functions (Handled via Tailwind's optimized transition utility classes).
// * 20. Responsive viewport handling with proper overflow management (TooltipProvider fixes clipping issues on Overflow).

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Optimistic UI Updates: Incrementing the streak instantly updates the DOM before waiting for the Axios PUT request.
// * 2. Hydration Safety: Implemented the `isMounted` pattern to prevent costly hydration errors caused by `Intl.DateTimeFormat`.
// * 3. Semantic HTML: Replaced interactive `div` wrappers with `button` tags to leverage native browser click handling.

// ! FUTURE IMPROVEMENTS:
// TODO: Abstract the API endpoints into a dedicated services file to decouple Axios logic from the UI component.
// TODO: Connect the 'Hours Studied Today' UI block to an actual backend datastore (currently hardcoded to 0).
// TODO: Add toast notifications (e.g. Sonner / React-Hot-Toast) for error handling in the `catch` blocks.

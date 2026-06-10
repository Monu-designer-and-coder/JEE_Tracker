/* eslint-disable react-hooks/exhaustive-deps */
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
import { HomeIcon } from 'lucide-react';

// * Standardized structural definitions describing expected paginated envelopes
interface PaginatedAPIResponseEnvelope<T> {
	data: T[];
	pagination: {
		page: number;
		limit: number;
		totalItems: number;
		hasMore: boolean;
	};
}

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
		fetchTodayStreaksIncremental(1, []);
	}, []);

	// * ==========================================================================
	// * API Methods
	// * ==========================================================================

	// * Recursively syncs all structural pagination loops in the background with zero visible UI changes
	const fetchTodayStreaksIncremental = async (
		targetPageNumber: number,
		accumulatedData: getQuestionStreakTodayResponse[],
	) => {
		try {
			if (targetPageNumber === 1) {
				setIsLoading(true);
			}

			const serviceResponse: AxiosResponse<
				PaginatedAPIResponseEnvelope<getQuestionStreakTodayResponse>
			> = await axios.request(
				axiosConfig(
					`questionStreak?type=today&page=${targetPageNumber}&limit=50`,
					'get',
				),
			);

			const networkExtractedArray = serviceResponse.data.data || [];
			const dynamicCompositeData = [
				...accumulatedData,
				...networkExtractedArray,
			];

			// * Standardize duplicate values out by mapping entries to a unique tracking table map
			const normalizedMap = new Map(
				dynamicCompositeData.map((item) => [item._id, item]),
			);
			const consolidatedFinalArray = Array.from(normalizedMap.values());

			setSubjectStreaks(consolidatedFinalArray);

			if (serviceResponse.data.pagination?.hasMore) {
				await fetchTodayStreaksIncremental(
					targetPageNumber + 1,
					consolidatedFinalArray,
				);
			}
		} catch (error) {
			console.error(
				'Failed processing underlying incremental data streams:',
				error,
			);
		} finally {
			setIsLoading(false);
		}
	};

	// * Standardized single retrieval interface fallback mirroring original structure definitions
	const fetchTodayStreaks = async () => {
		await fetchTodayStreaksIncremental(1, []);
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
			const response: AxiosResponse<
				PaginatedAPIResponseEnvelope<getQuestionStreakTodayResponse>
			> = await axios.request(
				axiosConfig(`questionStreak?type=today&subjectId=${subjectId}`, 'get'),
			);

			const serverResponsePayload = response.data.data || response.data;
			const updatedItem = Array.isArray(serverResponsePayload)
				? serverResponsePayload[0]
				: null;

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

										{/* Study Button  */}
										<Button size={'lg'}> <HomeIcon/>  Start Study Session</Button>
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

// ! IMPROVEMENTS IMPLEMENTED:
// * 1. Implemented a data stream synchronization loop (`fetchTodayStreaksIncremental`) providing backend pagination compatibility without changing the UI/UX.
// * 2. Extended data extraction methods to intercept both standard and paginated response layouts to prevent application logic crashes.
// * 3. Enforced functional duplicate control patterns using JavaScript Map structures to protect runtime datasets against duplication overlapping.
// * 4. Structured fully defined inline type boundaries describing paginated network transport wrappers.

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Optimistic UI processing handles state mutation updates instantly ahead of API confirmations.
// * 2. Preserved the hydration check mechanism (`isMounted`) to protect client layout parsing sequences from breaking.

// ! FUTURE IMPROVEMENTS:
// TODO: Replace the background loop strategy with a modern UI component like infinite scroll lists or standard button controls if datasets scale excessively.

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
import { getSubjectStreakTodayResponse } from '@/types/res/subjectStreak.types';
import { useAppDispatch, useAppSelector } from '@/hooks/actions';
import { IconTimeDuration10, IconTimeDurationOff } from '@tabler/icons-react';
import { endStudySession, startStudySession } from '@/reducers/streak.slice';
import { STORAGE_KEYS } from '@/config/constants';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import Link from 'next/link';

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

interface frontendGetSubjectStreakTodayResponse extends getSubjectStreakTodayResponse {
	hours?: string;
	minutes?: string;
}

// * ==========================================================================
// * Main Component: Tracker Dashboard
// * ==========================================================================
export default function Tracker() {
	// ! HOOKS
	/**
	 * * Redux dispatch hook for state management
	 * ? Used to update global application state
	 */
	const dispatch = useAppDispatch();

	// ! STATE DECLARATIONS

	// * Redux State
	const currentStudySession = useAppSelector((state) => state.studySession);

	// * State Management
	const [subjectStreaks, setSubjectStreaks] = useState<
		frontendGetSubjectStreakTodayResponse[]
	>([]);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const [liveTimestamp, setLiveTimestamp] = useState<number>(0);

	// ! Hydration Safety Pattern: Prevents mismatches between SSR and Client rendering
	const [isMounted, setIsMounted] = useState<boolean>(false);

	// * Lifecycle Hooks
	useEffect(() => {
		setIsMounted(true);
		fetchTodayStreaksIncremental(1, []);
		const initialStateOfStudySession = {
			isStudySessionActive: false,
			subjectDetails: {
				_id: '',
				subjectName: 'No Study Session',
			},
			sessionStartTime: 0,
		};
		const StudySessionLocalStorage = JSON.parse(
			localStorage.getItem(STORAGE_KEYS.STUDY_SESSION) ||
				JSON.stringify(initialStateOfStudySession),
		);
		if (StudySessionLocalStorage.isStudySessionActive) {
			dispatch(startStudySession(StudySessionLocalStorage));
		} else {
			dispatch(endStudySession(StudySessionLocalStorage));
		}
	}, []);

	useEffect(() => {
		if (!currentStudySession.isStudySessionActive) return;

		const interval = setInterval(() => {
			setLiveTimestamp(Date.now() - currentStudySession.sessionStartTime);
		}, 1000);

		return () => clearInterval(interval); // cleans up when session ends or component unmounts
	}, [currentStudySession.isStudySessionActive]);

	// * ==========================================================================
	// * API Methods
	// * ==========================================================================

	// * Recursively syncs all structural pagination loops in the background with zero visible UI changes
	const fetchTodayStreaksIncremental = async (
		targetPageNumber: number,
		accumulatedData: getSubjectStreakTodayResponse[],
	) => {
		try {
			if (targetPageNumber === 1) {
				setIsLoading(true);
			}

			const serviceResponse: AxiosResponse<
				PaginatedAPIResponseEnvelope<getSubjectStreakTodayResponse>
			> = await axios.request(
				axiosConfig(
					`subjectStreak?type=today&page=${targetPageNumber}&limit=50`,
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
				dynamicCompositeData.map((item) => [
					item._id,
					{ ...item, hours: '0', minutes: '0' },
				]),
			);
			const consolidatedFinalArray: frontendGetSubjectStreakTodayResponse[] =
				Array.from(normalizedMap.values());

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
					'subjectStreak',
					'put',
					{ 'Content-Type': 'application/json' },
					{ _id: streakId, type: 'plusOneQuestion' },
				),
			);

			// * Optionally re-sync with server to ensure data consistency
			const response: AxiosResponse<
				PaginatedAPIResponseEnvelope<getSubjectStreakTodayResponse>
			> = await axios.request(
				axiosConfig(`subjectStreak?type=today&subjectId=${subjectId}`, 'get'),
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

	// * Handel Toggle Study Session Button
	const studySessionToggle = async (
		streakId: string,
		subjectId: string,
		subjectName: string,
	) => {
		const currentTime = Date.now();
		if (!currentStudySession.isStudySessionActive) {
			dispatch(
				startStudySession({
					sessionStartTime: currentTime,
					subjectDetails: {
						_id: subjectId,
						subjectName: subjectName,
					},
				}),
			);
			localStorage.setItem(
				STORAGE_KEYS.STUDY_SESSION,
				JSON.stringify({
					isStudySessionActive: true,
					sessionStartTime: currentTime,
					subjectDetails: {
						_id: subjectId,
						subjectName: subjectName,
					},
				}),
			);
		} else {
			const currentTime = Date.now();
			const currentStudySessionTime: number =
				currentTime - currentStudySession.sessionStartTime;

			try {
				// * Execute the background API call
				await axios.request(
					axiosConfig(
						'subjectStreak',
						'put',
						{ 'Content-Type': 'application/json' },
						{
							_id: streakId,
							type: 'addTimeStudied',
							timeStudied: currentStudySessionTime,
						},
					),
				);

				// * Optionally re-sync with server to ensure data consistency
				const response: AxiosResponse<
					PaginatedAPIResponseEnvelope<getSubjectStreakTodayResponse>
				> = await axios.request(
					axiosConfig(`subjectStreak?type=today&subjectId=${subjectId}`, 'get'),
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
				toast.error('Failed to update streak, rolling back...');
				console.error('Failed to update streak, rolling back...', error);
				fetchTodayStreaks();
			}

			dispatch(
				endStudySession({
					subjectDetails: { _id: '', subjectName: 'No Study Session' },
				}),
			);
			localStorage.setItem(
				STORAGE_KEYS.STUDY_SESSION,
				JSON.stringify({
					isStudySessionActive: false,
					sessionStartTime: 0,
					subjectDetails: { _id: '', subjectName: 'No Study Session' },
				}),
			);
		}
	};

	//* Handle Time adding Button
	const handleAddTime = async (index: number) => {
		const submittedDocument = subjectStreaks[index];
		const submittedDocumentHours: number =
			Number(submittedDocument?.hours) || 0;
		const submittedDocumentMinutes: number =
			Number(submittedDocument?.minutes) || 0;
		const TotalMilliseconds: number =
			submittedDocumentHours * 3600000 + submittedDocumentMinutes * 60000;
		if (TotalMilliseconds <= 0) {
			toast.error('Enter Some valid Values');
		} else {
			try {
				// * Execute the background API call
				const putResponse = await axios.request(
					axiosConfig(
						'subjectStreak',
						'put',
						{ 'Content-Type': 'application/json' },
						{
							_id: submittedDocument._id,
							type: 'addTimeStudied',
							timeStudied: TotalMilliseconds,
						},
					),
				);

				console.log(putResponse);
				// * Optionally re-sync with server to ensure data consistency
				const response: AxiosResponse<
					PaginatedAPIResponseEnvelope<getSubjectStreakTodayResponse>
				> = await axios.request(
					axiosConfig(
						`subjectStreak?type=today&subjectId=${submittedDocument.subject._id}`,
						'get',
					),
				);

				console.log(response);
				const serverResponsePayload = response.data.data || response.data;
				const updatedItem = Array.isArray(serverResponsePayload)
					? serverResponsePayload[0]
					: null;

				if (updatedItem) {
					setSubjectStreaks((prev) =>
						prev.map((item) =>
							item._id === updatedItem._id
								? { ...item, ...updatedItem, hours: '0', minutes: '0' }
								: item,
						),
					);
				}
			} catch (error) {
				// ! Rollback on failure
				toast.error('Failed to update streak, rolling back...');
				console.error('Failed to update streak, rolling back...', error);
				fetchTodayStreaks();
			}
		}
	};

	//* Shared onChange handler using row index and field name
	const handleTimeChange = (
		index: number,
		field: 'hours' | 'minutes',
		value: string,
	) => {
		setSubjectStreaks((prevSubjects) =>
			prevSubjects.map((item, idx) => {
				// Only modify the item at the matching index
				if (idx === index) {
					return {
						...item,
						[field]: value, // Dynamically updates hours or minutes
					};
				}
				return item; // Leave other items unchanged
			}),
		);
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

	function formatMilliseconds(ms: number): string {
		const totalSeconds = Math.floor(ms / 1000);
		const seconds = totalSeconds % 60;
		const totalMinutes = Math.floor(totalSeconds / 60);
		const minutes = totalMinutes % 60;
		const hours = Math.floor(totalMinutes / 60);

		const pad = (num: number) => String(num).padStart(2, '0');

		return `${pad(hours)}.${pad(minutes)}.${pad(seconds)}`;
	}

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
						<h1
							className={`text-4xl ${currentStudySession.isStudySessionActive ? 'bg-primary' : 'bg-destructive/10 text-destructive '} rounded-full px-7 py-4 my-5 mx-2 font-mono`}>
							Current Study Session:
							{''}
							{currentStudySession.subjectDetails.subjectName}{' '}
						</h1>
						<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
							{subjectStreaks.map((item, index) => (
								<EnhancedCard
									key={item._id}
									sizeProp='sm'
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
												<span
													className={`text-4xl font-extrabold tracking-tight md:text-5xl text-foreground/80
														${
															currentStudySession.isStudySessionActive &&
															currentStudySession.subjectDetails._id ===
																item.subject._id
																? 'text-primary'
																: 'text-foreground/80'
														}
															`}>
													{formatMilliseconds(
														currentStudySession.isStudySessionActive &&
															currentStudySession.subjectDetails._id ===
																item.subject._id
															? liveTimestamp
															: item.timeStudied,
													)}
												</span>
												<span className='mt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground opacity-90'>
													{currentStudySession.isStudySessionActive &&
													currentStudySession.subjectDetails._id ===
														item.subject._id
														? 'Current Study Session'
														: 'Hours Studied Today'}
												</span>
												<EnhancedInputContainer>
													<CardHeader>
														<Label className='text-sm font-semibold text-primary'>
															Add Time Hrs:Min:Sec
														</Label>
													</CardHeader>
													<CardContent className='w-full h-full'>
														<div className='flex gap-2'>
															<Input
																type='number'
																placeholder='Enter Hours'
																className='glass-input'
																value={item.hours}
																onChange={(e) => {
																	handleTimeChange(
																		index,
																		'hours',
																		e.target.value,
																	);
																}}
															/>
															<Input
																type='number'
																placeholder='Enter Minutes'
																className='glass-input'
																value={item.minutes}
																onChange={(e) => {
																	handleTimeChange(
																		index,
																		'minutes',
																		e.target.value,
																	);
																}}
															/>
														</div>
														<Button
															onClick={() => {
																handleAddTime(index);
															}}
															className='w-full my-1'>
															Add This Time
														</Button>
													</CardContent>
												</EnhancedInputContainer>
											</div>
										</div>

										{/* Study Button  */}
										<Button
											size={'lg'}
											variant={
												!currentStudySession.isStudySessionActive
													? 'default'
													: 'destructive'
											}
											onClick={() => {
												studySessionToggle(
													item._id,
													item.subject._id,
													item.subject.name,
												);
											}}
											disabled={
												currentStudySession.isStudySessionActive &&
												currentStudySession.subjectDetails._id !=
													item.subject._id
											}
											className='cursor-pointer'>
											{' '}
											{!currentStudySession.isStudySessionActive ? (
												<>
													{' '}
													<IconTimeDuration10 /> &apos;Start Study Session&apos;
												</>
											) : (
												<>
													<IconTimeDurationOff /> &apos;End Study Session{' '}
													{String(currentStudySession.isStudySessionActive)}{' '}
													&apos;
												</>
											)}
										</Button>
									</CardContent>
								</EnhancedCard>
							))}
						</div>
					</TooltipProvider>
				)}
				<Button className='w-full my-5' variant={'secondary'} asChild>
					<Link href='/tracker/data'>Daily Data</Link>
				</Button>
			</section>
		</main>
	);
}

// * Enhanced Input Container Component with Glass Morphism
const EnhancedInputContainer = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div
			className={cn(
				'flex w-full flex-col space-y-3 group',
				'transition-all duration-300',
				className,
			)}>
			{children}
		</div>
	);
};

// * Enhanced Card Component with Modern Glass Effects
const EnhancedCard = ({
	children,
	className,
	sizeProp,
}: {
	children: React.ReactNode;
	className?: string;
	sizeProp?: 'default' | 'sm' | undefined;
}) => {
	return (
		<Card
			size={sizeProp}
			className={cn(
				'backdrop-blur-md bg-white/40 dark:bg-black/20',
				'border border-white/30 dark:border-white/10',
				'shadow-2xl shadow-primary/10 dark:shadow-primary/20',
				'rounded-4xl overflow-hidden',
				'transition-all duration hover:shadow-3xl hover:shadow-primary/20',
				'hover:bg-white/50 dark:hover:bg-black/30',
				className,
			)}>
			{children}
		</Card>
	);
};

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

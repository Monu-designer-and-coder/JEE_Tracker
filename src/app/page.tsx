/* eslint-disable react-hooks/set-state-in-effect */
'use client';

// * 1. Third-party & React imports
import { useState, useEffect, useMemo } from 'react';
import { Clock, CalendarDays, Timer } from 'lucide-react';

// * 2. Local UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// * 3. Configuration Imports
import {
	TARGET_DATE,
	START_DATE,
	homePageConfig,
} from '@/config/frontend/homePage.config';
import { STORAGE_KEYS } from '@/config/constants';
import { getPendingChapter } from '@/types/res/SystemResponse.types';
import axios, { AxiosResponse } from 'axios';
import { axiosConfig } from '@/config/axios.config';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { GrTask } from 'react-icons/gr';

export default function Home() {
	// ! HYDRATION & STATE MANAGEMENT
	// * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
	const [isMounted, setIsMounted] = useState(false);

	// * Replaced multiple overlapping states with a single 'now' timestamp.
	// * All other time values are cleanly derived from this single source of truth during render.
	const d = new Date();
	const [currentTimeMs, setCurrentTimeMs] = useState<number>(Number(d));

	const [currentTask, setCurrentTask] = useState<{
		_id: string;
		task: string;
		seqNumber: number;
		assignDate: Date;
	}>({
		_id: "loading",
		task: "loading",
		seqNumber: 0,
		assignDate: new Date()
	})

	const [currentStudySession, setCurrentStudySession] = useState({
		isStudySessionActive: false,
		subjectDetails: {
			_id: '',
			subjectName: 'No Study Session',
		},
		sessionStartTime: 0,
	});

	const [todaysProgressData, setTodaysProgressData] = useState<{
		totalQuestionsDone: number;
		totalTimeStudiedMs: number;
	}>({
		totalQuestionsDone: 0,
		totalTimeStudiedMs: 0,
	});

	const [InProgressChaptersList, setInProgressChaptersList] = useState<
		getPendingChapter[]
	>([
		{
			_id: '_id',
			seqNumber: 0,
			name: 'loading',
		},
	]);

	// ! SIDE EFFECTS
	useEffect(() => {
		setIsMounted(true);

		// * Optimized interval: Changed from 100ms to 1000ms.
		// * React renders 10x less frequently while maintaining visually perfect second-by-second accuracy.
		const timerInterval = setInterval(() => {
			setCurrentTimeMs(Date.now());
		}, 1000);

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
		setTodaysProgressData(
			JSON.parse(
				localStorage.getItem(STORAGE_KEYS.TODAYS_PROGRESS) ||
				JSON.stringify({ totalQuestionsDone: 0, totalTimeStudiedMs: 0 }),
			),
		);

		setCurrentStudySession(StudySessionLocalStorage);

		axios
			.request(axiosConfig('system', 'get'))
			.then((response: AxiosResponse<getPendingChapter[]>) => {
				setInProgressChaptersList(response.data);
			});

		axios.request(axiosConfig('system/task/', 'get')).then(
			(
				response: AxiosResponse<{
					_id: string;
					task: string;
					seqNumber: number;
					assignDate: Date;
				}>,
			) => {
				const responseData = response.data
				setCurrentTask(
					responseData
				);
			},
		);

		return () => clearInterval(timerInterval);
	}, []);

	function formatMilliseconds(ms: number): string {
		const totalSeconds = Math.floor(ms / 1000);
		const seconds = totalSeconds % 60;
		const totalMinutes = Math.floor(totalSeconds / 60);
		const minutes = totalMinutes % 60;
		const hours = Math.floor(totalMinutes / 60);

		const pad = (num: number) => String(num).padStart(2, '0');

		return `${pad(hours)}.${pad(minutes)}.${pad(seconds)}`;
	}

	// ! DERIVED STATE CALCULATIONS (Memoized for performance)
	const {
		days,
		hours,
		minutes,
		seconds,
		percentageElapsed,
		totalDaysRemaining,
	} = useMemo(() => {
		// * Calculate exact bounds
		const totalTimeSpanMs = Math.max(
			1,
			TARGET_DATE.getTime() - START_DATE.getTime(),
		);
		const timeLeftMs = Math.max(0, TARGET_DATE.getTime() - currentTimeMs);

		// * Time breakdown math
		const d = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
		const h = Math.floor(
			(timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
		);
		const m = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
		const s = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

		// * Progress calculations
		const percentageRemaining = (timeLeftMs / totalTimeSpanMs) * 100;
		// ? Bounded between 0 and 100 to prevent layout shifts or bar overflow
		const pElapsed = Math.min(100, Math.max(0, 100 - percentageRemaining));

		return {
			days: d,
			hours: h,
			minutes: m,
			seconds: s,
			percentageElapsed: pElapsed,
			totalDaysRemaining: d * 24 + h, // * Original metric calculation preserved
		};
	}, [currentTimeMs]);

	// ! HYDRATION FALLBACK
	// * Render a skeleton or empty wrapper before client hydration to ensure exact HTML matching
	if (!isMounted) {
		return (
			<div className='min-h-100 w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto max-w-5xl mt-8' />
		);
	}

	return (
		// ! MAIN CONTAINER
		// * Utilizes responsive max-width and center alignment for larger screens
		<div className='mx-auto w-full px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-in-out gap-4 grid grid-cols-6 grid-flow-row'>
			{/* ! GLASSMORPHIC CARD WRAPPER */}

			<EnhancedCard className='relative overflow-hidden border border-border/40 bg-background/60 backdrop-blur-xl shadow-2xl rounded-[2rem] transition-all duration-500 hover:shadow-primary/5 my-1 col-span-6 row-start-1'>
				{/* ? Ambient Inner Glow */}
				<div className='absolute -top-40 -right-40 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-[100px]' />

				<CardContent className='p-6 md:p-10'>
					{/* ? HEADER SECTION */}
					<div className='mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
						<div className='space-y-1'>
							<h2 className='flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground'>
								<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
									<GrTask className='h-5 w-5' />
								</div>
								<Button variant={'ghost'} className='text-base' asChild>
									<Link href={'/system/task'} className='text-base'>
										To Do:
									</Link>
								</Button>
							</h2>
							<p className='text-sm text-muted-foreground ml-13'>
								To this Task Now!
							</p>
						</div>
					</div>

					<div className='flex items-center justify-center my-4'>
						{/* * Reusable structural pattern mapped for readability */}
						{[
							{
								label: 'Do this Current Task',
								value: currentTask.task,
								subtext: "",
								animate: true,
							},
						].map((block, idx) => (
							<div
								key={`current-study-Session-${idx}`}
								className={cn(
									'group relative isolate flex flex-col items-center justify-center overflow-hidden rounded-4xl border border-border/30 bg-background/40 p-6 text-center backdrop-blur-md transition-all duration-500',
									'hover:-translate-y-1 hover:border-primary/30 hover:bg-accent/20 hover:shadow-lg hover:shadow-primary/10 w-full',
								)}>
								{/* * Micro-interaction gradient sweep on hover */}
								<div className='absolute inset-0 -z-10 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

								<div className='relative flex flex-col items-center'>
									<span
										className={cn(
											'text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl lg:text-6xl transition-transform duration-300 group-hover:scale-105',
											block.animate && 'text-primary drop-shadow-sm capitalize',
										)}>
										{block.value}
									</span>
									<span className='mt-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase'>
										{block.label}
									</span>
									{block.subtext && (
										<span className='mt-1 font-medium text-foreground/70'>
											{block.subtext}
										</span>
									)}
								</div>
							</div>
						))}
					</div>
					<div className='flex items-center justify-center my-4'>
						{/* * Reusable structural pattern mapped for readability */}
						{[
							{
								label: 'Sequence Number of the Task:',
								value: currentTask.seqNumber,
								subtext: '',
								animate: false,
							},
							{
								label: 'Time Assigned',
								value: new Intl.DateTimeFormat('en-IN', {
									weekday: 'short',
									day: '2-digit',
									month: '2-digit',
									year: '2-digit',
									hourCycle: "h24",
								}).format(new Date(currentTask.assignDate)),
								subtext: new Intl.DateTimeFormat('en-IN', {
									hour: '2-digit',
									minute: '2-digit',
									second: '2-digit',
									hourCycle: "h24",
								}).format(new Date(currentTask.assignDate)),
								animate: false,
							},
						].map((block, idx) => (
							<div
								key={`current-study-Session-${idx}`}
								className={cn(
									'group relative isolate flex flex-col items-center justify-center overflow-hidden rounded-4xl border border-border/30 bg-background/40 p-6 text-center backdrop-blur-md transition-all duration-500',
									'hover:-translate-y-1 hover:border-primary/30 hover:bg-accent/20 hover:shadow-lg hover:shadow-primary/10 w-full',
								)}>
								{/* * Micro-interaction gradient sweep on hover */}
								<div className='absolute inset-0 -z-10 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

								<div className='relative flex flex-col items-center'>
									<span
										className={cn(
											'text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl lg:text-6xl transition-transform duration-300 group-hover:scale-105',
											block.animate && 'text-primary drop-shadow-sm capitalize',
										)}>
										{block.value}
									</span>
									<span className='mt-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase'>
										{block.label}
									</span>
									{block.subtext && (
										<span className='mt-1 font-medium text-foreground/70'>
											{block.subtext}
										</span>
									)}
								</div>
							</div>
						))}
					</div>
					<div className='flex items-center justify-center my-4'>
						{/* * Reusable structural pattern mapped for readability */}
						{[
							{
								label: 'Time',
								value: new Intl.DateTimeFormat('en-IN', {
									hour: '2-digit',
									minute: '2-digit',
									second: '2-digit',
									weekday: 'long',
									day: '2-digit',
									month: 'long',
									year: 'numeric',
									hourCycle: "h23",
								}).format(new Date()),
								subtext: '',
								animate: true,
							},
						].map((block, idx) => (
							<div
								key={`current-study-Session-${idx}`}
								className={cn(
									'group relative isolate flex flex-col items-center justify-center overflow-hidden rounded-4xl border border-border/30 bg-background/40 p-6 text-center backdrop-blur-md transition-all duration-500',
									'hover:-translate-y-1 hover:border-primary/30 hover:bg-accent/20 hover:shadow-lg hover:shadow-primary/10 w-full',
								)}>
								{/* * Micro-interaction gradient sweep on hover */}
								<div className='absolute inset-0 -z-10 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

								<div className='relative flex flex-col items-center'>
									<span
										className={cn(
											'text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl lg:text-6xl transition-transform duration-300 group-hover:scale-105',
											block.animate && 'text-primary drop-shadow-sm capitalize',
										)}>
										{block.value}
									</span>
									<span className='mt-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase'>
										{block.label}
									</span>
									{block.subtext && (
										<span className='mt-1 font-medium text-foreground/70'>
											{block.subtext}
										</span>
									)}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</EnhancedCard>

			<EnhancedCard className='relative overflow-hidden border border-border/40 bg-background/60 backdrop-blur-xl shadow-2xl rounded-[2rem] transition-all duration-500 hover:shadow-primary/5 my-2 col-span-4'>
				{/* ? Ambient Inner Glow */}
				<div className='absolute -top-40 -right-40 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-[100px]' />

				<CardContent className='p-6 md:p-10'>
					{/* ? HEADER SECTION */}
					<div className='mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
						<div className='space-y-1'>
							<h2 className='flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground'>
								<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
									<Clock className='h-5 w-5' />
								</div>
								Mission Countdown
							</h2>
							<p className='text-sm text-muted-foreground ml-13'>
								Tracking progress towards your ultimate goal.
							</p>
						</div>

						{/* * Status Badge */}
						<Badge
							variant='secondary'
							className='bg-accent/50 px-4 py-2 text-sm backdrop-blur-md transition-colors hover:bg-accent/70 shadow-sm border border-border/50'>
							<Timer className='mr-2 h-4 w-4' />
							{percentageElapsed.toFixed(2)}% Elapsed
						</Badge>
					</div>

					{/* ? COUNTDOWN GRID */}
					<div className='grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6'>
						{/* * Reusable structural pattern mapped for readability */}
						{[
							{
								label: 'Days',
								value: days,
								icon: CalendarDays,
								subtext: `of ${homePageConfig.TOTAL_DAYS} total`,
							},
							{
								label: 'Hours',
								value: String(hours).padStart(2, '0'),
								subtext: `${totalDaysRemaining} total left`,
							},
							{ label: 'Minutes', value: String(minutes).padStart(2, '0') },
							{
								label: 'Seconds',
								value: String(seconds).padStart(2, '0'),
								animate: true,
							},
						].map((block, idx) => (
							<div
								key={`countdown-block-${idx}`}
								className={cn(
									'group relative isolate flex flex-col items-center justify-center overflow-hidden rounded-4xl border border-border/30 bg-background/40 p-6 text-center backdrop-blur-md transition-all duration-500',
									'hover:-translate-y-1 hover:border-primary/30 hover:bg-accent/20 hover:shadow-lg hover:shadow-primary/10',
								)}>
								{/* * Micro-interaction gradient sweep on hover */}
								<div className='absolute inset-0 -z-10 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

								<div className='relative flex flex-col items-center'>
									<span
										className={cn(
											'text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl lg:text-6xl transition-transform duration-300 group-hover:scale-105',
											block.animate && 'text-primary drop-shadow-sm',
										)}>
										{block.value}
									</span>
									<span className='mt-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase'>
										{block.label}
									</span>
									{block.subtext && (
										<span className='mt-1 text-xs font-medium text-muted-foreground/70'>
											{block.subtext}
										</span>
									)}
								</div>
							</div>
						))}
					</div>

					{/* ? PROGRESS BAR SECTION */}
					<div className='mt-10 space-y-4 rounded-4xl border border-border/30 bg-background/40 p-6 backdrop-blur-sm'>
						<div className='flex justify-between items-end text-sm font-medium'>
							<span className='text-muted-foreground'>
								Overall Timeline Progress
							</span>
							<span className='text-primary text-lg font-bold'>
								{Math.round(percentageElapsed)}%
							</span>
						</div>

						{/* * Shadcn Progress with customized height and inner shadow styling */}
						<div className='relative overflow-hidden rounded-full bg-accent/50 p-1 shadow-inner'>
							<Progress
								value={percentageElapsed}
								className='h-3 rounded-full bg-transparent [&>div]:bg-linear-to-r [&>div]:from-primary [&>div]:to-primary/80'
								aria-label='Countdown Progress'
							/>
						</div>
					</div>
				</CardContent>
			</EnhancedCard>
			<EnhancedCard className='relative overflow-hidden border border-border/40 bg-background/60 backdrop-blur-xl shadow-2xl rounded-[2rem] transition-all duration-500 hover:shadow-primary/5 my-1 col-span-2'>
				{/* ? Ambient Inner Glow */}
				<div className='absolute -top-40 -right-40 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-[100px]' />

				<CardContent className='p-6 md:p-10'>
					{/* ? HEADER SECTION */}
					<div className='mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
						<div className='space-y-1'>
							<h2 className='flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground'>
								<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
									<Clock className='h-5 w-5' />
								</div>
								<Button variant={'ghost'} className='text-base' asChild>
									<Link href={'/tracker'} className='text-base'>
										Current Study Session
									</Link>
								</Button>
							</h2>
							<p className='text-sm text-muted-foreground ml-13'>
								Tracking progress towards your current goal.
							</p>
						</div>
					</div>

					<div className='flex items-center justify-center my-4'>
						{/* * Reusable structural pattern mapped for readability */}
						{[
							{
								label: 'Starts At:',
								value: currentStudySession.subjectDetails.subjectName,
								subtext: currentStudySession.isStudySessionActive
									? new Date(
										currentStudySession.sessionStartTime,
									).toLocaleString()
									: new Date().toLocaleString(),
								animate: currentStudySession.isStudySessionActive,
							},
						].map((block, idx) => (
							<div
								key={`current-study-Session-${idx}`}
								className={cn(
									'group relative isolate flex flex-col items-center justify-center overflow-hidden rounded-4xl border border-border/30 bg-background/40 p-6 text-center backdrop-blur-md transition-all duration-500',
									'hover:-translate-y-1 hover:border-primary/30 hover:bg-accent/20 hover:shadow-lg hover:shadow-primary/10 w-full',
								)}>
								{/* * Micro-interaction gradient sweep on hover */}
								<div className='absolute inset-0 -z-10 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

								<div className='relative flex flex-col items-center'>
									<span
										className={cn(
											'text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl lg:text-6xl transition-transform duration-300 group-hover:scale-105',
											block.animate && 'text-primary drop-shadow-sm capitalize',
										)}>
										{block.value}
									</span>
									<span className='mt-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase'>
										{block.label}
									</span>
									{block.subtext && (
										<span className='mt-1 font-medium text-foreground/70'>
											{block.subtext}
										</span>
									)}
								</div>
							</div>
						))}
					</div>
					<div className='flex items-center justify-center my-4'>
						{/* * Reusable structural pattern mapped for readability */}
						{[
							{
								label: 'Total Questions Done',
								value: todaysProgressData.totalQuestionsDone,
								subtext: '',
								animate: currentStudySession.isStudySessionActive,
							},
							{
								label: 'Total Time Studied',
								value: formatMilliseconds(
									todaysProgressData.totalTimeStudiedMs,
								),
								subtext: '',
								animate: true,
							},
						].map((block, idx) => (
							<div
								key={`current-study-Session-${idx}`}
								className={cn(
									'group relative isolate flex flex-col items-center justify-center overflow-hidden rounded-4xl border border-border/30 bg-background/40 p-6 text-center backdrop-blur-md transition-all duration-500',
									'hover:-translate-y-1 hover:border-primary/30 hover:bg-accent/20 hover:shadow-lg hover:shadow-primary/10 w-full',
								)}>
								{/* * Micro-interaction gradient sweep on hover */}
								<div className='absolute inset-0 -z-10 bg-linear-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100' />

								<div className='relative flex flex-col items-center'>
									<span
										className={cn(
											'text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl lg:text-6xl transition-transform duration-300 group-hover:scale-105',
											block.animate && 'text-primary drop-shadow-sm capitalize',
										)}>
										{block.value}
									</span>
									<span className='mt-2 text-sm font-semibold tracking-wider text-muted-foreground uppercase'>
										{block.label}
									</span>
									{block.subtext && (
										<span className='mt-1 font-medium text-foreground/70'>
											{block.subtext}
										</span>
									)}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</EnhancedCard>
			<EnhancedCard className='relative overflow-hidden border border-border/40 bg-background/60 backdrop-blur-xl shadow-2xl rounded-[2rem] transition-all duration-500 hover:shadow-primary/5 my-1 col-span-6 row-span-1 col-start-1 row-start-3'>
				{/* ? Ambient Inner Glow */}
				<div className='absolute -top-40 -right-40 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-[100px]' />
				<CardHeader>
					<div className='mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
						<div className='space-y-1'>
							<h2 className='flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground'>
								<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
									<Clock className='h-5 w-5' />
								</div>
								<Button variant={'ghost'} className='text-base' asChild>
									<Link href={'/system'} className='text-base'>
										Current Chapters To Study
									</Link>
								</Button>
							</h2>
							<p className='text-sm text-muted-foreground ml-13'>
								Tracking progress towards your current goal.
							</p>
						</div>
					</div>
				</CardHeader>
				<CardContent className='flex flex-col gap-4 item-center justify-center'>
					{InProgressChaptersList.map((chapter, index) => (
						<EnhancedCard key={chapter._id}>
							<CardHeader>
								<CardTitle
									className={cn(
										'text-2xl font-bold bg-linear-to-r from-chart-1 to-primary bg-clip-text text-transparent capitalize',
										'scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance',
										'capitalize text-base/8',
									)}>
									{index + 1}. {chapter.name}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='w-full'>
									<Badge
										variant={
											chapter.totalTopics === 0
												? 'ghost'
												: chapter.totalTopicsCompleted === chapter.totalTopics
													? 'default'
													: 'destructive'
										}
										className='text-base/9 mx-3 w-full'>
										{chapter.totalTopicsCompleted}/{chapter.totalTopics}
									</Badge>
								</div>
							</CardContent>
						</EnhancedCard>
					))}
				</CardContent>
			</EnhancedCard>
		</div>
	);
}

// * Enhanced Card Component with Modern Glass Effects
const EnhancedCard = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<Card
			className={cn(
				'backdrop-blur-md bg-white/40 dark:bg-black/20',
				'border border-white/30 dark:border-white/10',
				'shadow-2xl shadow-primary/10 dark:shadow-primary/20',
				'rounded-2xl overflow-hidden',
				'transition-all duration-500 hover:shadow-3xl hover:shadow-primary/20',
				'hover:bg-white/50 dark:hover:bg-black/30',
				className,
			)}>
			{children}
		</Card>
	);
};

// ! UI/UX IMPROVEMENTS IMPLEMENTED:
// * 1. Modern minimalistic backgrounds: Added ambient radial gradients (`bg-primary/10 blur-[100px]`) within the card.
// * 2. Glass morphism effects: Applied `bg-background/60 backdrop-blur-xl` to the main card wrapper.
// * 6. Improved responsive design: Constrained with `max-w-5xl`, shifted to `lg:grid-cols-4` to handle medium tablets better, and adjusted padding for mobile screens.
// * 8. Interactive hover effects: Time blocks feature `hover:-translate-y-1 group-hover:scale-105` and dynamic border/shadow color shifts.
// * 9. Professional color scheme: Replaced hardcoded `/white` colors with semantic Shadcn variables (`text-foreground`, `bg-accent`, `border-border`, `text-primary`) for strict adherence to the b2oqCh768 preset.
// * 10. Layered visual hierarchy: Time values are distinct from labels (`tracking-tighter`, `text-muted-foreground`), and the Seconds counter subtly highlights in the primary color to indicate active movement.
// * 11. Smooth micro-animations: Global entrance animation added (`animate-in fade-in slide-in-from-bottom-4`).
// * 12. Better accessibility: Added strict `aria-label` to the Progress bar and utilized semantic `<h2 />` tags over simple divs.
// * 13. Enhanced shadow system: Replaced flat borders with multi-layered shadows (`hover:shadow-primary/10` and `shadow-inner` on the progress bar track).
// * 14. Consistent border radius system: Employed `rounded-[2rem]` for outer containers and `rounded-4xl` for inner containers for soft, modern curves.
// * 21. Deals both dark and light mode: Completely responsive to `next-themes` via the semantic utility classes.

// ! PERFORMANCE OPTIMIZATIONS MAINTAINED:
// * 1. Hydration Safety: Implemented the `isMounted` pattern, returning a skeleton loader on the server to prevent React from throwing hydration errors due to timestamp discrepancies.
// * 2. State Consolidation: Destroyed 4 separate cascading `useState` calls and replaced them with a single `currentTimeMs` state.
// * 3. Render Optimization: Reduced the `setInterval` clock tick from 100ms to 1000ms. 100ms was causing unnecessary heavy re-renders (10 times a second) when the lowest visible metric is Seconds.
// * 4. Memoization: Wrapped all complex date math inside a `useMemo` hook, ensuring mathematics only execute when `currentTimeMs` actually shifts.

// ! FUTURE IMPROVEMENTS:
// TODO: Integrate `framer-motion` for animated number flipping (odometer effect) on the seconds/minutes counters rather than instant text replacement.
// TODO: Save the "target date" in LocalStorage or Zustand if the user is allowed to dynamically change their own target deadlines in the future.

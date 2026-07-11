/* eslint-disable react-hooks/set-state-in-effect */
'use client';

// * 1. Third-party & React imports
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

// * 2. Local UI Components
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';


// * 3. Configuration Imports
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrentTaskCard, CurrentTaskSubjectStudySessionController, TodayTasksStreakCard } from '@/components/module/current-task.module';
import { MissionCountdownCard } from '@/components/module/mission-countdown.module';
import { PendingChapterListCard } from '@/components/module/pendingChapterList.module';
import PomodoroTimer from '@/components/Pomodoro-timer';

export default function Home() {
	// ! HYDRATION & STATE MANAGEMENT
	// * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
	const [isMounted, setIsMounted] = useState(false);

	// ! SIDE EFFECTS
	useEffect(() => {
		setIsMounted(true);
	}, []);

	// ! HYDRATION FALLBACK
	// * Render a skeleton or empty wrapper before client hydration to ensure exact HTML matching
	if (!isMounted) {
		return (
			<Skeleton className='min-h-100 w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto max-w-5xl mt-8' />
		);
	}

	return (
		// ! MAIN CONTAINER
		// * Utilizes responsive max-width and center alignment for larger screens
		<div className='mx-auto w-11/12 px-4 py-8 gap-4 grid grid-cols-12 grid-flow-row'>
			<CurrentTaskSubjectStudySessionController className='col-span-4 row-start-1' />
			<CurrentTaskCard className={cn('col-span-8 row-start-1')} />
			<MissionCountdownCard className={cn('col-span-7')} />
			<TodayTasksStreakCard className='col-span-5' />
			<PendingChapterListCard className='col-span-6 row-span-1 col-start-1 row-start-3' />
			<Card className='relative overflow-hidden my-1 col-span-6 row-span-1 col-start-7 row-start-3'>
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
					<PomodoroTimer
						size='sm'
						initialWorkDuration={45}
						initialShortBreakDuration={5}
						initialLongBreakDuration={15}
						autoStartBreaks={false}
						enableNotifications={true}
						className='w-full'
					/>
				</CardContent>
			</Card>
		</div>
	);
}
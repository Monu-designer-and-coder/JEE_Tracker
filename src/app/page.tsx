/* eslint-disable react-hooks/set-state-in-effect */
'use client';

// * 1. Third-party & React imports
import { useState, useEffect } from 'react';

// * 2. Local UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';


// * 3. Configuration Imports
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrentTaskCard, CurrentTaskSubjectStudySessionController, TodayTasksStreakCard } from '@/components/module/current-task.module';
import { MissionCountdownCard } from '@/components/module/mission-countdown.module';
import { PendingChapterListCard } from '@/components/module/pendingChapterList.module';
import PomodoroTimer from '@/components/Pomodoro-timer';
import { FcClock } from 'react-icons/fc';

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
					<CardTitle className='flex gap-3 items-center'>
						<FcClock className='h-5 w-5' />
						<Button variant={'ghost'} className='text-lg font-badge' asChild>
							<Link href={'/pomodoro/'}>
								POMODORO
							</Link>
						</Button>
					</CardTitle>
					<CardDescription>
						Focus Session
					</CardDescription>
				</CardHeader>
				<CardContent>
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
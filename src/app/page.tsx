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
import { ChapterModularUI } from '@/components/module/chapter.module';

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
			<ChapterModularUI 
			className='col-span-12 row-span-1'
			chapter = {{
				"_id": "6a3171ff1bd1c0777cb61fd0",
				"seqNumber": 2,
				"name": "Kinematics",
				"done": false,
				"theory": false,
				"shortNotes": false,
				"mindMap": false,
				"DPP1": false,
				"DPP2": false,
				"Module": false,
				"PYQ_Mains": false,
				"PYQ_Advanced": false,
				"Book": false,
				"totalTopics": 14,
				"subject": {
					"_id": "6a251189f37357e395a82f13",
					"name": "physics"
				},
				"topicsList": [
					{
						"_id": "6a38b9232af03b0af13535c1",
						"name": "Introduction",
						"seqNumber": 1,
						"done": true,
						"theory": true,
						"inTextQuestions": true,
						"inClassQuestions": true
					},
					{
						"_id": "6a38b9312af03b0af13535c2",
						"name": "Distance and Displacement",
						"seqNumber": 2,
						"done": true,
						"theory": true,
						"inTextQuestions": true,
						"inClassQuestions": true
					},
					{
						"_id": "6a38b93d2af03b0af13535c3",
						"name": "Velocity and Speed",
						"seqNumber": 3,
						"done": true,
						"theory": true,
						"inTextQuestions": true,
						"inClassQuestions": true
					},
					{
						"_id": "6a38b9402af03b0af13535c4",
						"name": "Acceleration",
						"seqNumber": 4,
						"done": true,
						"theory": true,
						"inTextQuestions": true,
						"inClassQuestions": true
					},
					{
						"_id": "6a38b94a2af03b0af13535c5",
						"name": "Motion in Straight Line",
						"seqNumber": 5,
						"done": true,
						"theory": true,
						"inTextQuestions": true,
						"inClassQuestions": true
					},
					{
						"_id": "6a38b9562af03b0af13535c6",
						"name": "Motion Under Gravity 1D",
						"seqNumber": 6,
						"done": true,
						"theory": true,
						"inTextQuestions": true,
						"inClassQuestions": true
					},
					{
						"_id": "6a38b9642af03b0af13535c7",
						"name": "Motion on Inclined Plane 1D",
						"seqNumber": 7,
						"done": true,
						"theory": true,
						"inTextQuestions": true,
						"inClassQuestions": false
					},
					{
						"_id": "6a38b96b2af03b0af13535c8",
						"name": "Relative Motion in 1D",
						"seqNumber": 8,
						"done": true,
						"theory": true,
						"inTextQuestions": true,
						"inClassQuestions": false
					},
					{
						"_id": "6a38b9762af03b0af13535c9",
						"name": "Graphs in Motion in 1D",
						"seqNumber": 9,
						"done": true,
						"theory": true,
						"inTextQuestions": true,
						"inClassQuestions": false
					},
					{
						"_id": "6a38b98a2af03b0af13535ca",
						"name": "Velocity and Acceleration in 2D",
						"seqNumber": 10,
						"done": true,
						"theory": true,
						"inTextQuestions": true,
						"inClassQuestions": false
					},
					{
						"_id": "6a38b98f2af03b0af13535cb",
						"name": "Projectile Motion",
						"seqNumber": 11,
						"done": true,
						"theory": true,
						"inTextQuestions": true,
						"inClassQuestions": false
					},
					{
						"_id": "6a38b9992af03b0af13535cc",
						"name": "Horizontal Projectile",
						"seqNumber": 12,
						"done": true,
						"theory": true,
						"inTextQuestions": true,
						"inClassQuestions": false
					},
					{
						"_id": "6a38b9a32af03b0af13535cd",
						"name": "Projectile on an Inclined Plane",
						"seqNumber": 13,
						"done": false,
						"theory": false,
						"inTextQuestions": false,
						"inClassQuestions": false
					},
					{
						"_id": "6a38b9ab2af03b0af13535ce",
						"name": "Relative Motion",
						"seqNumber": 14,
						"done": false,
						"theory": false,
						"inTextQuestions": false,
						"inClassQuestions": false
					}
				],
				"currentChapterStatus": "inProgress",
				"totalTopicsCompleted": 12,
				"totalTopicsTheoryCompleted": 12,
				"totalTopicsCompletedPercentage": 85.71428571428571,
				"totalTopicsTheoryCompletedPercentage": 85.71428571428571
			}} />
		</div>
	);
}
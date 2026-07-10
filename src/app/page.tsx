/* eslint-disable react-hooks/set-state-in-effect */
'use client';

// * 1. Third-party & React imports
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

// * 2. Local UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardAction } from '@/components/ui/card';
import { cn } from '@/lib/utils';


// * 3. Configuration Imports
import { STORAGE_KEYS } from '@/config/constants';
import { getPendingChapter } from '@/types/res/SystemResponse.types';
import axios, { AxiosResponse } from 'axios';
import { axiosConfig } from '@/config/axios.config';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PomodoroTimer from '@/components/Pomodoro-timer';
import { Skeleton } from '@/components/ui/skeleton';
import { CardBlockUI, cardBlockUIOrientation } from '@/components/module/card-block.module';
import { FcLink, FcParallelTasks, FcPlanner } from 'react-icons/fc';
import { CurrentTaskCard } from '@/components/module/current-task.module';
import { MissionCountdownCard } from '@/components/module/mission-countdown.module';

export default function Home() {
	// ! HYDRATION & STATE MANAGEMENT
	// * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
	const [isMounted, setIsMounted] = useState(false);


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
			<CurrentTaskCard className={cn('col-span-12 row-start-1')} />
			<MissionCountdownCard className={cn('col-span-7')} />
			<Card className='relative overflow-hidden my-1 col-span-5'>
				<CardHeader className=' gap-4'>
					<CardTitle className='flex items-center gap-3 text-2xl font-bold tracking-tight text-foreground'>
						<div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
							<FcPlanner className='h-5 w-5' />
						</div>
						<Button variant={'ghost'} className='text-base' asChild>
							<Link href={'/tracker'} className='text-base'>
								Current Study Session
							</Link>
						</Button>
					</CardTitle>
					<CardDescription className='text-sm text-muted-foreground ml-13'>
						Tracking progress towards your current goal.
					</CardDescription>
					<CardAction>
						<Button variant="link" asChild>
							<Link href={'/tracker'}>
								<FcLink className="w-5 h-5" />
							</Link>
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent className='p-6 md:p-10'>
					<div className='flex items-center justify-center my-4 w-11/12 mx-auto'>
						<CardBlockUI
							className="grid-cols-1"
							cardBlockUIContentList={[
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
							]}
						/>
					</div>
					<div className='flex items-center justify-center my-4 w-11/12 mx-auto'>
						<CardBlockUI
							className="grid-cols-1"
							cardBlockUIContentList={[
								{
									label: 'Total Questions Done',
									value: String(todaysProgressData.totalQuestionsDone),
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
							]}
						/>
					</div>
				</CardContent>
			</Card>
			<Card className='relative overflow-hidden my-1 col-span-6 row-span-1 col-start-1 row-start-3'>
				<CardHeader >
					<CardTitle className='flex items-center gap-3 '>
						<FcParallelTasks />
						<Button variant={'ghost'} className='text-lg font-badge' asChild>
							<Link href={'/system/'}>
								Current Chapters To Study
							</Link>
						</Button>
					</CardTitle>
					<CardDescription>
						Tracking progress towards your current goal.
					</CardDescription>
					<CardAction>
						<Button variant="link" asChild>
							<Link href={'/system/'}>
								<FcLink className="w-5 h-5" />
							</Link>
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent className='flex flex-col gap-4 item-center justify-center'>
					<div className='flex items-center justify-center flex-col my-4'>
						<CardBlockUI
							cardBlockUIContentList={
								InProgressChaptersList.map((chapter) => (
									{
										label: 'Topics:',
										value: chapter.name,
										subtext: `${chapter.totalTopicsCompleted}/${chapter.totalTopics} : ${Math.round(((chapter?.totalTopicsCompleted || 0) * 100 / (chapter?.totalTopics || 1)))}%`,
										animate: Math.round(((chapter?.totalTopicsCompleted || 0) * 100 / (chapter?.totalTopics || 1))) >= 75,
									}
								))
							}
							orientation={cardBlockUIOrientation.Vertical}
						/>
					</div>
				</CardContent>
			</Card>
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
					{/* <PomodoroTimer
						size='md'
						initialWorkDuration={45}
						initialShortBreakDuration={5}
						initialLongBreakDuration={15}
						autoStartBreaks={false}
						enableNotifications={true}
						className='w-full '
					/> */}
					POMODORO
				</CardContent>
			</Card>
		</div>
	);
}
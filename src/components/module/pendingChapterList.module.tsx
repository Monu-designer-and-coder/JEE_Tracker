'use client';

import { axiosConfig } from '@/config/axios.config';
import axios, { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';
import { Skeleton } from '../ui/skeleton';
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '../ui/card';
import { FcLink, FcParallelTasks } from 'react-icons/fc';
import { Button } from '../ui/button';
import Link from 'next/link';
import { CardBlockUI, cardBlockUIOrientation } from './card-block.module';
import { cn } from '@/lib/utils';
import { iApiResponse } from '@/types/backend/apiResponse.types';
import { iDetailedChapterResponse } from '@/types/res/chapter.res.types';

export const PendingChapterListCard = ({
	className,
}: {
	className?: string;
}) => {
	// ! HYDRATION & STATE MANAGEMENT
	// * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
	const [isMounted, setIsMounted] = useState(false);

	const [InProgressChaptersList, setInProgressChaptersList] = useState<
		iDetailedChapterResponse[]
	>([]);

	// ! SIDE EFFECTS
	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setIsMounted(true);
		axios
			.request(axiosConfig('system', 'get'))
			.then(
				(response: AxiosResponse<iApiResponse<iDetailedChapterResponse[]>>) => {
					setInProgressChaptersList(response.data.data);
				},
			);
	}, []);

	// ! HYDRATION FALLBACK
	// * Render a skeleton or empty wrapper before client hydration to ensure exact HTML matching
	if (!isMounted) {
		return (
			<Skeleton className='min-h-100 w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto max-w-5xl mt-8' />
		);
	}

	return (
		<Card className={cn('relative overflow-hidden my-1', className)}>
			<CardHeader>
				<CardTitle className='flex items-center gap-3 '>
					<FcParallelTasks />
					<Button variant={'ghost'} className='text-lg font-badge' asChild>
						<Link href={'/system/'}>Current Chapters To Study</Link>
					</Button>
				</CardTitle>
				<CardDescription>
					Tracking progress towards your current goal.
				</CardDescription>
				<CardAction>
					<Button variant='link' asChild>
						<Link href={'/system/'}>
							<FcLink className='w-5 h-5' />
						</Link>
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent className='flex flex-col gap-4 item-center justify-center'>
				<div className='flex items-center justify-center flex-col my-4'>
					<CardBlockUI
						cardBlockUIContentList={InProgressChaptersList.map((chapter) => ({
							label: 'Topics:',
							value: chapter.name,
							subtext: `${chapter.totalTopicsCompleted}/${chapter.totalTopics} : ${Math.round(((chapter?.totalTopicsCompleted || 0) * 100) / (chapter?.totalTopics || 1))}%`,
							animate:
								Math.round(
									((chapter?.totalTopicsCompleted || 0) * 100) /
										(chapter?.totalTopics || 1),
								) >= 75,
						}))}
						orientation={cardBlockUIOrientation.Vertical}
					/>
				</div>
			</CardContent>
		</Card>
	);
};

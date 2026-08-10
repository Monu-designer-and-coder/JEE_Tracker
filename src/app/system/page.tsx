'use client';

import { Container } from '@/components/base/Container.base.component';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	Item,
	ItemActions,
	ItemContent,
	ItemMedia,
	ItemTitle,
} from '@/components/ui/item';
import { Skeleton } from '@/components/ui/skeleton';
import { axiosConfig } from '@/config/axios.config';
import { chapterStatusUpdateSchema } from '@/schema/studyTask.schema';
import axios, { AxiosResponse } from 'axios';
// * 1. Third-party & React imports
import { useState, useEffect, useMemo } from 'react';
import { FcRight } from 'react-icons/fc';
import z from 'zod';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import { ChapterModularUI } from '@/components/module/chapter.module';
import Fade from 'embla-carousel-fade';
import { interleaveArrays } from '@/lib/helpers';
import { iApiResponse } from '@/types/backend/apiResponse.types';
import { iSubjectWiseChaptersListByChapterStatus } from '@/types/res/system.res.types';
import { iDetailedChapterResponse } from '@/types/res/chapter.res.types';

export default function Home() {
	// ! HYDRATION & STATE MANAGEMENT
	// * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
	const [isMounted, setIsMounted] = useState(false);

	const [pendingChapterList, setPendingChapterList] =
		useState<iSubjectWiseChaptersListByChapterStatus[]>([
			{
				_id: 'loading',
				name: 'loading',
				chapterList: [
					{
						_id: '_id',
						seqNumber: 0,
						name: 'loading',
					},
				],
			},
		]);
	const [InProgressChaptersList, setInProgressChaptersList] = useState<
		iDetailedChapterResponse[]
	>([]);
	const [upcomingChaptersList, setUpcomingChaptersList] = useState<
		iSubjectWiseChaptersListByChapterStatus[]
	>([]);
	const [unfinishedChaptersList, setUnfinishedChaptersList] = useState<
		iSubjectWiseChaptersListByChapterStatus[]
	>([]);
	const [completedChaptersList, setCompletedChaptersList] = useState<
		iSubjectWiseChaptersListByChapterStatus[]
	>([]);

	function fetchInprogressChapters() {
		axios
			.request(axiosConfig('system', 'get'))
			.then(
				(response: AxiosResponse<iApiResponse<iDetailedChapterResponse[]>>) => {
					setInProgressChaptersList(response.data.data);
				},
			);
	}
	function fetchUpComingChapters() {
		axios
			.request(axiosConfig('system?type=getUpcomingList', 'get'))
			.then(
				(
					response: AxiosResponse<
						iApiResponse<iSubjectWiseChaptersListByChapterStatus[]>
					>,
				) => {
					setUpcomingChaptersList(response.data.data);
				},
			);
	}
	function fetchUnfinishedChapters() {
		axios
			.request(axiosConfig('system?type=getUnfinishedList', 'get'))
			.then(
				(
					response: AxiosResponse<
						iApiResponse<iSubjectWiseChaptersListByChapterStatus[]>
					>,
				) => {
					setUnfinishedChaptersList(response.data.data);
				},
			);
	}
	function fetchCompletedChapters() {
		axios
			.request(axiosConfig('system?type=getCompletedList', 'get'))
			.then(
				(
					response: AxiosResponse<
						iApiResponse<iSubjectWiseChaptersListByChapterStatus[]>
					>,
				) => {
					setCompletedChaptersList(response.data.data);
				},
			);
	}
	function fetchPendingChapters() {
		axios
			.request(axiosConfig('system?type=getPendingList', 'get'))
			.then(
				(
					response: AxiosResponse<
						iApiResponse<iSubjectWiseChaptersListByChapterStatus[]>
					>,
				) => {
					setPendingChapterList(response.data.data);
				},
			);
	}

	// ! SIDE EFFECTS
	useEffect(() => {
		setIsMounted(true);
		fetchInprogressChapters();
		fetchUpComingChapters();
		fetchUnfinishedChapters();
		fetchCompletedChapters();
		fetchPendingChapters();
	}, []);

	// * Memoized Axios Configuration - Performance optimization
	const markChapterStatusAxiosConfigHook = useMemo(
		() =>
			axiosConfig('system/study-task/chapter-status', 'put', {
				'Content-Type': 'application/json',
			}),
		[],
	);

	async function markChapterUpcoming(chapterId: string) {
		type markChapterUpcomingType = z.infer<typeof chapterStatusUpdateSchema>;
		const data: markChapterUpcomingType = {
			chapterId,
			type: 'markAsUpcoming',
		};
		const config = {
			...markChapterStatusAxiosConfigHook,
			data,
		};
		await axios.request(config);
		fetchUpComingChapters();
		fetchPendingChapters();
	}
	async function markChapterInProgress(chapterId: string) {
		type markChapterUpcomingType = z.infer<typeof chapterStatusUpdateSchema>;
		const data: markChapterUpcomingType = {
			chapterId,
			type: 'markAsInProgress',
		};
		const config = {
			...markChapterStatusAxiosConfigHook,
			data,
		};
		await axios.request(config);
		fetchInprogressChapters();
		fetchUpComingChapters();
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
		<Tabs
			defaultValue='chapterStatus'
			className='w-full h-[85vh] py-3 px-2 overflow-scroll no-scrollbar'>
			<TabsList variant={'line'}>
				<TabsTrigger value='chapterStatus'>Chapters Status</TabsTrigger>
				<TabsTrigger value='currentChapters'>Current Chapters</TabsTrigger>
			</TabsList>
			<TabsContent
				value='chapterStatus'
				className='mx-auto w-11/12 gap-4 grid grid-cols-12 grid-rows-12 h-[80vh] px-2 py-4'>
				<Card className='col-span-4 row-span-10 overflow-scroll scroll-smooth no-scrollbar'>
					<CardHeader>
						<CardTitle>
							Pending Chapters
							<Badge>
								{
									pendingChapterList
										.map((subject) => subject.chapterList)
										.flat().length
								}
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent className='gap-2 flex flex-col'>
						{interleaveArrays(
							pendingChapterList.map(
								(subject) => subject.chapterList,
							),
						).map((chapter, index) => (
							<Item key={chapter._id} variant={'outline'}>
								<ItemMedia variant='icon'>
									{index + 1}
									<FcRight />
								</ItemMedia>
								<ItemContent>
									<ItemTitle>{chapter.name}</ItemTitle>
								</ItemContent>
								<ItemActions>
									<Button
										onClick={() => {
											markChapterUpcoming(chapter._id);
										}}
										size={'sm'}>
										Mark Upcoming.
									</Button>
								</ItemActions>
							</Item>
						))}
					</CardContent>
				</Card>
				<Container className='col-span-4 row-span-10 flex flex-col gap-4'>
					<Card className='w-full h-1/2 overflow-scroll scroll-smooth no-scrollbar'>
						<CardHeader>
							<CardTitle>
								Up coming Chapters{' '}
								<Badge>
									{
										upcomingChaptersList
											.map((subject) => subject.chapterList)
											.flat().length
									}
								</Badge>
							</CardTitle>
						</CardHeader>
						<CardContent className='gap-2 flex flex-col'>
							{interleaveArrays(
								upcomingChaptersList.map((subject) => subject.chapterList),
							).map((chapter, index) => (
								<Item key={chapter._id} variant={'outline'}>
									<ItemMedia variant='icon'>
										{index + 1}
										<FcRight />
									</ItemMedia>
									<ItemContent>
										<ItemTitle>{chapter.name}</ItemTitle>
									</ItemContent>
									<ItemActions>
										<Button
											onClick={() => {
												markChapterInProgress(chapter._id);
											}}
											size={'sm'}>
											Mark Inprogress
										</Button>
									</ItemActions>
								</Item>
							))}
						</CardContent>
					</Card>
					<Card className='w-full h-1/2 overflow-scroll scroll-smooth no-scrollbar'>
						<CardHeader>
							<CardTitle>
								In Progress Chapters{' '}
								<Badge>{InProgressChaptersList.length}</Badge>
							</CardTitle>
						</CardHeader>
						<CardContent className='gap-2 flex flex-col'>
							{InProgressChaptersList.map((chapter, index) => (
								<Item key={String(chapter._id)} variant={'outline'}>
									<ItemMedia variant='icon'>
										{index + 1}
										<FcRight />
									</ItemMedia>
									<ItemContent>
										<ItemTitle>{chapter.name}</ItemTitle>
									</ItemContent>
									<ItemActions>
										<Button size={'sm'}>Mark Unfinished</Button>
									</ItemActions>
								</Item>
							))}
						</CardContent>
					</Card>
				</Container>
				<Card className='col-span-4 row-span-10 overflow-scroll scroll-smooth no-scrollbar'>
					<CardHeader>
						<CardTitle>
							Un-finished Chapters
							<Badge>
								{
									unfinishedChaptersList
										.map((subject) => subject.chapterList)
										.flat().length
								}
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent className='gap-2 flex flex-col'>
						{interleaveArrays(
							unfinishedChaptersList.map((subject) => subject.chapterList),
						).map((chapter, index) => (
							<Item key={chapter._id} variant={'outline'}>
								<ItemMedia variant='icon'>
									{index + 1}
									<FcRight />
								</ItemMedia>
								<ItemContent>
									<ItemTitle>{chapter.name}</ItemTitle>
								</ItemContent>
								<ItemActions>
									<Button size={'sm'}>Mark Completed</Button>
								</ItemActions>
							</Item>
						))}
					</CardContent>
				</Card>
				<Card className='col-span-12 row-span-2 overflow-scroll scroll-smooth no-scrollbar'>
					<CardHeader>
						<CardTitle>
							Completed Chapters
							<Badge>
								{
									completedChaptersList
										.map((subject) => subject.chapterList)
										.flat().length
								}
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent className='gap-2 flex flex-col'>
						{interleaveArrays(
							completedChaptersList.map((subject) => subject.chapterList),
						).map((chapter, index) => (
							<Item key={chapter._id} variant={'outline'}>
								<ItemMedia variant='icon'>
									{index + 1} <FcRight />
								</ItemMedia>
								<ItemContent>
									<ItemTitle>{chapter.name}</ItemTitle>
								</ItemContent>
								<ItemActions>
									<Button size={'sm'}>Done</Button>
								</ItemActions>
							</Item>
						))}
					</CardContent>
				</Card>
			</TabsContent>
			<TabsContent value='currentChapters' className='py-4'>
				<Container className='w-[95%] mx-auto	'>
					<Carousel plugins={[Fade()]}>
						<CarouselContent>
							{InProgressChaptersList.map((chapter) => (
								<CarouselItem key={String(chapter._id)}>
									<ChapterModularUI
										chapterDetails={chapter}
										className='w-full h-full'
									/>
								</CarouselItem>
							))}
						</CarouselContent>
						<CarouselPrevious />
						<CarouselNext />
					</Carousel>
				</Container>
			</TabsContent>
		</Tabs>
	);
}

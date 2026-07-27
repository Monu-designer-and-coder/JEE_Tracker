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
import {
	getPendingChapter,
	getPendingChapterSubjectWiseList,
} from '@/types/res/SystemResponse.types';
import axios, { AxiosResponse } from 'axios';
// * 1. Third-party & React imports
import { useState, useEffect, useMemo } from 'react';
import { FcRight } from 'react-icons/fc';
import z from 'zod';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { syllabusDetailedDataChapter } from '@/types/res/syllabusDataResponse.types';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import { ChapterModularUI } from '@/components/module/chapter.module';
import Fade from 'embla-carousel-fade';

export default function Home() {
	// ! HYDRATION & STATE MANAGEMENT
	// * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
	const [isMounted, setIsMounted] = useState(false);

	const [pendingChapterSubjectWiseList, setPendingChapterSubjectWiseList] =
		useState<getPendingChapterSubjectWiseList[]>([
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
		syllabusDetailedDataChapter[]
	>([]);
	const [upcomingChaptersList, setUpcomingChaptersList] = useState<
		getPendingChapter[]
	>([
		{
			_id: '_id',
			seqNumber: 0,
			name: 'loading',
		},
	]);
	const [unfinishedChaptersList, setUnfinishedChaptersList] = useState<
		getPendingChapterSubjectWiseList[]
	>([]);
	const [completedChaptersList, setCompletedChaptersList] = useState<
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

		axios
			.request(axiosConfig('system?type=getPendingList', 'get'))
			.then((response: AxiosResponse<getPendingChapterSubjectWiseList[]>) => {
				setPendingChapterSubjectWiseList(response.data);
			});
		axios
			.request(axiosConfig('system?type=getUpcomingList', 'get'))
			.then((response: AxiosResponse<getPendingChapter[]>) => {
				setUpcomingChaptersList(response.data);
			});
		axios
			.request(axiosConfig('system', 'get'))
			.then((response: AxiosResponse<syllabusDetailedDataChapter[]>) => {
				setInProgressChaptersList(response.data);
			});
		axios
			.request(axiosConfig('system?type=getUnfinishedList', 'get'))
			.then((response: AxiosResponse<getPendingChapterSubjectWiseList[]>) => {
				setUnfinishedChaptersList(response.data);
			});
		axios
			.request(axiosConfig('system?type=getCompletedList', 'get'))
			.then((response: AxiosResponse<getPendingChapter[]>) => {
				setCompletedChaptersList(response.data);
			});
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
		axios
			.request(axiosConfig('system?type=getPendingList', 'get'))
			.then((response: AxiosResponse<getPendingChapterSubjectWiseList[]>) => {
				setPendingChapterSubjectWiseList(response.data);
			});
		axios
			.request(axiosConfig('system?type=getUpcomingList', 'get'))
			.then((response: AxiosResponse<getPendingChapter[]>) => {
				setUpcomingChaptersList(response.data);
			});
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
		axios
			.request(axiosConfig('system', 'get'))
			.then((response: AxiosResponse<syllabusDetailedDataChapter[]>) => {
				setInProgressChaptersList(response.data);
			});
		axios
			.request(axiosConfig('system?type=getUpcomingList', 'get'))
			.then((response: AxiosResponse<getPendingChapter[]>) => {
				setUpcomingChaptersList(response.data);
			});
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
									pendingChapterSubjectWiseList
										.map((subject) => subject.chapterList)
										.flat().length
								}
							</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent className='gap-2 flex flex-col'>
						{interleaveArrays(
							pendingChapterSubjectWiseList.map(
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
								Up coming Chapters <Badge>{upcomingChaptersList.length}</Badge>
							</CardTitle>
						</CardHeader>
						<CardContent className='gap-2 flex flex-col'>
							{upcomingChaptersList.map((chapter, index) => (
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
								<Item key={chapter._id} variant={'outline'}>
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
							Completed Chapters<Badge>{completedChaptersList.length}</Badge>
						</CardTitle>
					</CardHeader>
					<CardContent className='gap-2 flex flex-col'>
						{completedChaptersList.map((chapter, index) => (
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
					<Carousel plugins={[Fade(),]}>
						<CarouselContent>
							{InProgressChaptersList.map((chapter) => (
								<CarouselItem key={chapter._id}>
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

function interleaveArrays<T>(arrays: T[][]): T[] {
	let totalElements = 0;
	let maxLength = 0;

	// 1. Calculate dimensions to pre-allocate memory and find the longest array
	for (let i = 0; i < arrays.length; i++) {
		const len = arrays[i].length;
		totalElements += len;
		if (len > maxLength) {
			maxLength = len;
		}
	}

	// 2. Pre-allocate the result array for maximum performance
	const result = new Array<T>(totalElements);
	let currentIndex = 0;

	// 3. Loop column-by-column, then row-by-row
	for (let col = 0; col < maxLength; col++) {
		for (let row = 0; row < arrays.length; row++) {
			// Only read if the current array actually has an element at this column index
			if (col < arrays[row].length) {
				result[currentIndex++] = arrays[row][col];
			}
		}
	}

	return result;
}

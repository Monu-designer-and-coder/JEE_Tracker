/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { ChapterModularUI } from '@/components/module/chapter.module';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { axiosConfig } from '@/config/axios.config';
import { cn } from '@/lib/utils';
import axios, { AxiosResponse } from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FcLink } from 'react-icons/fc';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import {
	NativeSelect,
	NativeSelectOption,
} from '@/components/ui/native-select';
import { iApiResponse } from '@/types/backend/apiResponse.types';
import { iChapterList } from '@/types/res/chapterList.types';
import { iDetailedChapterResponse } from '@/types/res/chapter.res.types';

export default function SyllabusHomePage() {
	const subjectList = [
		{
			_id: '6a25121bf37357e395a82f16',
			name: 'Chemistry',
		},
		{
			_id: '6a251223f37357e395a82f17',
			name: 'Mathematics',
		},
		{
			_id: '6a251189f37357e395a82f13',
			name: 'Physics',
		},
	];

	// ! HYDRATION & STATE MANAGEMENT
	// * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const [selectedChapterData, setSelectedChapterData] =
		useState<iDetailedChapterResponse>({
			_id: '6a25121bf37357e395a82f16',
			seqNumber: 0,
			name: 'Select A Chapter',
			done: false,
			theory: false,
			shortNotes: false,
			mindMap: false,
			DPP1: false,
			DPP2: false,
			Module: false,
			PYQ_Mains: false,
			PYQ_Advanced: false,
			Book: false,
			totalTopics: 0,
			subject: {
				_id: '6a25121bf37357e395a82f16',
				name: 'Please Select Some Subject',
			},
			topicsList: [],
			currentChapterStatus: 'pending',
			totalTopicsCompleted: 0,
			totalTopicsCompletedPercentage: 0,
			totalTopicsTheoryCompleted: 0,
			totalTopicsTheoryCompletedPercentage: 0,
		});

	const [selectedChapter, setSelectedChapter] = useState<string>(
		String('6a25121bf37357e395a82f10'),
	);
	const [chaptersList, setChaptersList] = useState<iChapterList[]>([]);
	const [selectedSubject, setSelectedSubject] = useState<string>(
		String('6a25121bf37357e395a82f10'),
	);

	// ! SIDE EFFECTS
	useEffect(() => {
		setIsMounted(true);
		setIsLoading(false);
	}, []);

	useEffect(() => {
		axios
			.request(
				axiosConfig(
					`syllabus/data/getChapterList?id=${selectedSubject}`,
					'get',
				),
			)
			.then((response: AxiosResponse<iApiResponse<iChapterList[]>>) => {
				setChaptersList(response.data.data);
			})
			.catch(() => {});
	}, [selectedSubject]);
	useEffect(() => {
		axios
			.request(axiosConfig(`syllabus/chapter?id=${selectedChapter}`, 'get'))
			.then(
				(response: AxiosResponse<iApiResponse<iDetailedChapterResponse>>) => {
					setSelectedChapterData(response.data.data);
				},
			)
			.catch(() => {});
	}, [selectedChapter]);

	// ! HYDRATION FALLBACK
	// * Render a skeleton or empty wrapper before client hydration to ensure exact HTML matching
	if (!isMounted) {
		return (
			<Skeleton className='min-h-100 w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto max-w-5xl mt-8' />
		);
	}

	return (
		<main className='relative w-[95%] mx-auto my-4 px-4'>
			{/* * Content Section */}
			<section className='relative z-10 mx-auto w-full  flex flex-col justify-center'>
				{isLoading ? (
					// * Loading State
					<div className='flex h-64 items-center justify-center'>
						<div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary' />
					</div>
				) : (
					<section className='w-full h-full grid gap-4'>
						<header className='w-full'>
							<Card className='h-full'>
								<CardHeader>
									<CardTitle className='font-heading font-normal text-4xl'>
										Select The Chapter
									</CardTitle>
									<CardAction>
										<Button variant='link' asChild>
											<Link href={'/system/'}>
												<FcLink className='w-5 h-5' />
											</Link>
										</Button>
									</CardAction>
								</CardHeader>
								<CardContent className='grid grid-cols-12 gap-5'>
									<section className='gap-3 col-span-4 grid grid-cols-6'>
										<div className='col-span-2'>
											<Select
												value={selectedSubject}
												onValueChange={(e) => {
													setSelectedSubject(e);
												}}
												defaultValue={'6a25121bf37357e395a82f10'}>
												<SelectTrigger className='w-full' size='default'>
													<SelectValue placeholder='Select the subject of the chapter' />
												</SelectTrigger>
												<SelectContent className=''>
													<SelectItem value='6a25121bf37357e395a82f10' disabled>
														Select the subject of the chapter
													</SelectItem>
													{subjectList.map((subject) => (
														<SelectItem key={subject._id} value={subject._id}>
															{subject.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className='col-span-4'>
											<NativeSelect
												value={selectedChapter}
												onChange={(e) => {
													setSelectedChapter(e.target.value);
												}}>
												{chaptersList.map((selectedChapterFromTheList) => (
													<NativeSelectOption
														key={String(selectedChapterFromTheList._id)}
														value={String(selectedChapterFromTheList._id)}>
														{selectedChapterFromTheList.name}
													</NativeSelectOption>
												))}
											</NativeSelect>
										</div>
									</section>
									<section className='col-span-8 grid grid-cols-12 gap-2'>
										<div className='col-span-5 border border-primary rounded-full px-3 py-2 flex items-center gap-5'>
											<h3 className='font-badge text-lg text-primary font-medium'>
												Current Chapter Status
											</h3>
											<p
												className={cn(
													'text-base font-normal font-content-primary capitalize',
													selectedChapterData.seqNumber == 0
														? 'text-muted'
														: 'text-foreground/80',
												)}>
												{selectedChapterData.currentChapterStatus}
											</p>
										</div>
										<div className='col-span-5 border border-primary rounded-full px-3 py-2 flex items-center gap-5'>
											<h3 className='font-badge text-lg text-primary font-medium'>
												Current Sequence
											</h3>
											<Button
												variant={'default'}
												size={'icon'}
												disabled={selectedChapterData.seqNumber - 2 < 0}
												onClick={() => {
													setSelectedChapter(
														String(
															chaptersList[selectedChapterData.seqNumber - 2]
																._id,
														),
													);
												}}>
												{' '}
												<ChevronLeftIcon />
											</Button>
											<p
												className={cn(
													'text-base font-normal font-content-primary capitalize',
													selectedChapterData.seqNumber == 0
														? 'text-muted'
														: 'text-foreground/80',
												)}>
												{selectedChapterData.seqNumber}
											</p>
											<Button
												variant={'default'}
												size={'icon'}
												disabled={
													selectedChapterData.seqNumber >= chaptersList.length
												}
												onClick={() => {
													setSelectedChapter(
														String(
															chaptersList[selectedChapterData.seqNumber]._id,
														),
													);
												}}>
												{' '}
												<ChevronRightIcon />
											</Button>
										</div>
									</section>
								</CardContent>
							</Card>
						</header>
						<ChapterModularUI
							className='w-full'
							chapterDetails={selectedChapterData}
						/>
					</section>
				)}
			</section>
		</main>
	);
}

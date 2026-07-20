/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { ChapterModularUI } from '@/components/module/chapter.module';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Table,
	TableBody,
	TableCaption,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { axiosConfig } from '@/config/axios.config';
import { cn } from '@/lib/utils';
import { getSubjectWiseChapterResponse } from '@/types/res/chapterResponse.types';
import { subjectsChaptersList, syllabusDetailedDataChapter } from '@/types/res/syllabusDataResponse.types';
import axios, { AxiosResponse } from 'axios';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FcLink } from 'react-icons/fc';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';



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

	const [selectedChapterData, setSelectedChapterData] = useState<syllabusDetailedDataChapter>({
		_id: 'chapter_id',
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
		subject: { _id: 'subject_id', name: 'Please Select Some Subject' },
		topicsList: [],
		currentChapterStatus: 'pending',
		totalTopicsCompleted: 0,
		totalTopicsCompletedPercentage: 0,
		totalTopicsTheoryCompleted: 0,
		totalTopicsTheoryCompletedPercentage: 0,
	})

	const [selectedChapter, setSelectedChapter] = useState<string>(String("6a25121bf37357e395a82f10"))
	const [chaptersList, setChaptersList] = useState<subjectsChaptersList[]>([])
	const [selectedSubject, setSelectedSubject] = useState<string>(String("6a25121bf37357e395a82f10"))

	// ! SIDE EFFECTS
	useEffect(() => {
		setIsMounted(true);
		setIsLoading(false);
	}, []);

	useEffect(() => {
		axios
			.request(axiosConfig(`syllabus/data/getChapterList?id=${selectedSubject}`, 'get'))
			.then((response: AxiosResponse<subjectsChaptersList[]>) => {
				setChaptersList(response.data);
			}).catch(() => { })
	}, [selectedSubject])
	useEffect(() => {
		axios
			.request(axiosConfig(`syllabus/chapter?id=${selectedChapter}`, 'get'))
			.then((response: AxiosResponse<syllabusDetailedDataChapter>) => {
				setSelectedChapterData(response.data);
			}).catch(() => { })
	}, [selectedChapter])

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
									<CardTitle className='font-heading font-normal text-4xl'>Select The Chapter</CardTitle>
									<CardAction>
										<Button variant="link" asChild>
											<Link href={'/system/'}>
												<FcLink className="w-5 h-5" />
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
													setSelectedSubject(e)
												}}
												defaultValue={"6a25121bf37357e395a82f10"}
											>
												<SelectTrigger className='w-full' size='default'>
													<SelectValue placeholder='Select the subject of the chapter' />
												</SelectTrigger>
												<SelectContent className=''>
													<SelectItem value='6a25121bf37357e395a82f10' disabled>Select the subject of the chapter</SelectItem>
													{subjectList.map((subject) => (
														<SelectItem
															key={subject._id}
															value={subject._id}>
															{subject.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
										<div className='col-span-4'>
											<Select
												value={selectedChapter}
												onValueChange={(e) => {
													setSelectedChapter(e)
												}}
												defaultValue={"6a25121bf37357e395a82f10"}>
												<SelectTrigger size='sm' className='w-full'>
													<SelectValue placeholder='Select the chapter of the selected Chapter' />
												</SelectTrigger>
												<SelectContent className='w-full'>
													<SelectItem value='6a25121bf37357e395a82f10' disabled>Select the chapter of the selected Chapter</SelectItem>
													{chaptersList.map((chapter) => (
														<SelectItem
															key={chapter._id}
															value={chapter._id}>
															{chapter.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</section>
									<section className="col-span-8 grid grid-cols-12 gap-2">
										<div className='col-span-5 border border-primary rounded-full px-3 py-2 flex items-center gap-5'>
											<h3 className='font-badge text-lg text-primary font-medium'>Current Chapter Status</h3>
											<p className={cn("text-base font-normal font-content-primary capitalize", selectedChapterData.seqNumber == 0 ? "text-muted" : "text-foreground/80")}>{selectedChapterData.currentChapterStatus}</p>
										</div>
										<div className='col-span-5 border border-primary rounded-full px-3 py-2 flex items-center gap-5'>
											<h3 className='font-badge text-lg text-primary font-medium'>Current Sequence</h3>
											<Button variant={"default"} size={"icon"} disabled={selectedChapterData.seqNumber - 2 < 0} onClick={() => { setSelectedChapter(chaptersList[selectedChapterData.seqNumber - 2]._id) }}> <ChevronLeftIcon /></Button>
											<p className={cn("text-base font-normal font-content-primary capitalize", selectedChapterData.seqNumber == 0 ? "text-muted" : "text-foreground/80")}>{selectedChapterData.seqNumber}</p>
											<Button variant={"default"} size={"icon"} disabled={selectedChapterData.seqNumber >= chaptersList.length} onClick={() => { setSelectedChapter(chaptersList[selectedChapterData.seqNumber]._id) }}> <ChevronRightIcon /></Button>
										</div>
									</section>
								</CardContent>
							</Card>
						</header >
						<ChapterModularUI
							className='w-full'
							chapterDetails={selectedChapterData}
						/>
					</section >
				)
				}
			</section >
		</main >
	);
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TabsOfChapter_OldLayout() {
	const [chapterList, setChapterList] = useState<
		getSubjectWiseChapterResponse[]
	>([
		{
			_id: 'loading',
			name: 'loading',
			chapterList: [
				{
					_id: '_id',
					seqNumber: 0,
					name: 'loading',
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
				},
			],
		},
	]);

	useEffect(() => {
		axios
			.request(axiosConfig('syllabus/chapter?type=subjectWise', 'get'))
			.then((response: AxiosResponse<getSubjectWiseChapterResponse[]>) => {
				setChapterList(response.data);
			});
	}, []);


	return (
		<Tabs
			orientation='horizontal'
			defaultValue='defaultTab'
			className='w-full my-4'>
			<TabsList variant='line'>
				<TabsTrigger value='defaultTab' disabled>
					Default
				</TabsTrigger>
				{chapterList.map((subject) => (
					<TabsTrigger
						className='capitalize'
						key={subject._id}
						value={subject.name}>
						{subject.name}
					</TabsTrigger>
				))}
			</TabsList>
			<TabsContent value={'defaultTab'}>
				<Card>
					<CardHeader>
						<CardTitle className='text-2xl font-bold bg-linear-to-r from-chart-1 to-primary bg-clip-text text-transparent capitalize'>
							Select Some Subject
						</CardTitle>
						<CardDescription className='text-secondary-foreground'>
							-------------------------------------------
						</CardDescription>
					</CardHeader>
				</Card>
			</TabsContent>
			{chapterList.map((subject) => (
				<TabsContent key={subject._id} value={subject.name}>
					<Card className='w-full'>
						<CardHeader>
							<CardTitle className='text-2xl font-bold bg-linear-to-r from-chart-1 to-primary bg-clip-text text-transparent capitalize'>
								{subject.name}
							</CardTitle>
							<CardDescription className='text-secondary-foreground'>
								List of all the chapters of the subject {subject.name}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Table className=''>
								<TableCaption>A list of your chapters.</TableCaption>
								<TableHeader>
									<TableRow>
										<TableHead className='capitalize text-xs'>
											S.No:
										</TableHead>
										<TableHead className='capitalize text-xs'>
											Chapter Name
										</TableHead>
										<TableHead className='capitalize text-xs'>
											done
										</TableHead>
										<TableHead className='capitalize text-xs'>
											theory
										</TableHead>
										<TableHead className='capitalize text-xs'>
											shortNotes
										</TableHead>
										<TableHead className='capitalize text-xs'>
											mindMap
										</TableHead>
										<TableHead className='capitalize text-xs'>
											DPP1
										</TableHead>
										<TableHead className='capitalize text-xs'>
											DPP2
										</TableHead>
										<TableHead className='capitalize text-xs'>
											Module
										</TableHead>
										<TableHead className='capitalize text-xs'>
											PYQ_Mains
										</TableHead>
										<TableHead className='capitalize text-xs'>
											PYQ_Advanced
										</TableHead>
										<TableHead className='capitalize text-xs'>
											Book
										</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{subject.chapterList.map((chapter) => (
										<TableRow
											key={chapter.seqNumber + '-' + chapter.name}>
											<TableCell>{chapter.seqNumber}</TableCell>
											<TableCell className='text-xs'>
												{chapter.name}
											</TableCell>
											<TableCell
												className={cn(
													'border',
													chapter.done
														? 'bg-green-600'
														: 'bg-red-600',
												)}></TableCell>
											<TableCell
												className={cn(
													'border',
													chapter.theory
														? 'bg-green-600'
														: 'bg-red-600',
												)}></TableCell>
											<TableCell
												className={cn(
													'border',
													chapter.shortNotes
														? 'bg-green-600'
														: 'bg-red-600',
												)}></TableCell>
											<TableCell
												className={cn(
													'border',
													chapter.mindMap
														? 'bg-green-600'
														: 'bg-red-600',
												)}></TableCell>
											<TableCell
												className={cn(
													'border',
													chapter.DPP1
														? 'bg-green-600'
														: 'bg-red-600',
												)}></TableCell>
											<TableCell
												className={cn(
													'border',
													chapter.DPP2
														? 'bg-green-600'
														: 'bg-red-600',
												)}></TableCell>
											<TableCell
												className={cn(
													'border',
													chapter.Module
														? 'bg-green-600'
														: 'bg-red-600',
												)}></TableCell>
											<TableCell
												className={cn(
													'border',
													chapter.PYQ_Mains
														? 'bg-green-600'
														: 'bg-red-600',
												)}></TableCell>
											<TableCell
												className={cn(
													'border',
													chapter.PYQ_Advanced
														? 'bg-green-600'
														: 'bg-red-600',
												)}></TableCell>
											<TableCell
												className={cn(
													'border',
													chapter.Book
														? 'bg-green-600'
														: 'bg-red-600',
												)}></TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>
			))}
		</Tabs>
	);
}
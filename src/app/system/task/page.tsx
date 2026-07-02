'use client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { cn } from '@/lib/utils';
import {
	inProgressChaptersCurrentTaskList,
	inProgressChaptersTaskList,
} from '@/types/res/SystemResponse.types';
import { useEffect, useState } from 'react';
import axios, { AxiosResponse } from 'axios';
import { axiosConfig } from '@/config/axios.config';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

import Autoplay from "embla-carousel-autoplay"
import carouselFade from "embla-carousel-fade"

export default function SyllabusHomePage() {
	// ! HYDRATION & STATE MANAGEMENT
	// * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
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

	const [
		allListOfCurrentTasksChapterInProgress,
		setAllListOfCurrentTasksChapterInProgress,
	] = useState<inProgressChaptersCurrentTaskList[]>([]);
	const [allListOfTasksChapterInProgress, setAllListOfTasksChapterInProgress] =
		useState<inProgressChaptersTaskList[]>([]);


	// ! SIDE EFFECTS
	useEffect(() => {
		setIsMounted(true);
		setIsLoading(false);


		fetchTaskLists()
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
	}, []);


	function fetchTaskLists() {
		axios.request(axiosConfig('system/task/list', 'get')).then(
			(
				response: AxiosResponse<{
					allListOfTasksChapterInProgress: inProgressChaptersTaskList[];
					allListOfCurrentTasksChapterInProgress: inProgressChaptersCurrentTaskList[];
				}>,
			) => {
				setAllListOfCurrentTasksChapterInProgress(
					response.data.allListOfCurrentTasksChapterInProgress,
				);
				setAllListOfTasksChapterInProgress(
					response.data.allListOfTasksChapterInProgress,
				);
			},
		);
	}

	async function handleTaskButton(task: string) {
		if (!currentTask._id || currentTask._id == "loading") {
			await axios.request(axiosConfig('system/task', "post", { "Content-Type": "application/json" }, {
				task,
			}))
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
			fetchTaskLists();
		}
		if (task === currentTask.task) {
			try {
				await axios.request(axiosConfig('system/task', "put", { "Content-Type": "application/json" }, {
					taskId: currentTask._id,
					type: "markTaskAsFinished"
				}))
			}
			catch (error) {
				console.log(error)
			}
			finally {
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
				fetchTaskLists();
			}
		}
	}


	// ! HYDRATION FALLBACK
	// * Render a skeleton or empty wrapper before client hydration to ensure exact HTML matching
	if (!isMounted) {
		return (
			<div className='min-h-100 w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto max-w-5xl mt-8' />
		);
	}

	return (
		<main className='relative min-h-[80vh] w-full overflow-hidden overflow-y-auto bg-background px-4 py-8 md:px-8'>
			{/* * Ambient Background Effects (Aceternity / Minimalist styling) */}
			<div className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
				<div className='absolute -left-[10%] top-[20%] h-125 w-125 rounded-full bg-primary/10 blur-[120px] mix-blend-screen' />
				<div className='absolute right-[5%] top-[10%] h-100 w-100 rounded-full bg-primary/10 blur-[100px] mix-blend-screen' />
			</div>

			{/* * Content Section */}
			<section className='relative z-10 mx-auto max-w-7xl h-[80vh] flex flex-col justify-center'>
				{isLoading ? (
					// * Loading State
					<div className='flex h-64 items-center justify-center'>
						<div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary' />
					</div>
				) : (
					<div className='w-full h-full'>
						<header className='flex items-center justify-between w-full'>
							<h1 className='text-primary text-6xl font-black'>SYSTEM/Task</h1>
							<Badge
								className={`text-xl px-7 py-4 my-5 mx-2 font-mono`}
							>
								{currentTask.seqNumber}. Task: {currentTask?.task}
							</Badge>
						</header>
						<EnhancedCard className='w-full h-11/12'>
							<CardContent className='grid w-full h-full grid-cols-12 gap-3'>
								<EnhancedCard className='w-full h-full col-span-6 rounded-4xl'>
									<CardHeader>
										<CardTitle>
											<h2 className='w-full text-center text-2xl capitalize'>
												Chose Current Task From List
											</h2>
										</CardTitle>
									</CardHeader>
									<CardContent className='grid grid-cols-1 grid-rows-3 h-full gap-3 w-full'>
										{allListOfCurrentTasksChapterInProgress.map((item) => (
											<div
												className='w-full h-full rounded-4xl border p-4 flex flex-col items-center justify-center gap-5'
												key={item.chapter}>
												<h3 className='w-full text-center text-xl'>
													{item.task}
												</h3>
												<Button onClick={() => handleTaskButton(item.task)} className='w-full py-3 px-4' disabled={((Boolean(currentTask._id) && (currentTask._id != "loading")) && (currentTask.task != item.task))}>
													{(currentTask.task == item.task) ? "Mark as Done" : "Make this Current Task"}
												</Button>
											</div>
										))}
									</CardContent>
								</EnhancedCard>
								<EnhancedCard className='w-full h-full col-span-6 rounded-4xl'>
									<CardHeader>
										<CardTitle>
											<h2 className='w-full text-center text-2xl capitalize'>
												List of Task To Do:
											</h2>
										</CardTitle>
									</CardHeader>
									<CardContent className='h-full w-full overflow-auto flex items-center justify-center'>
										<Carousel className="w-10/12"
											opts={{
												containScroll: false
											}}
											plugins={[
												Autoplay({
													delay: 2500
												}),
												carouselFade()
											]}
										>
											<CarouselContent>
												{allListOfTasksChapterInProgress.map((item) => {
													const topicsToDo = item.topicsToComplete.map(topic => ({ task: topic, chapter: item.chapter, heading: `Topic To Do for: ${item.chapter}` }))
													const tagsToDo = item.tagsToComplete.map(topic => ({ task: topic, chapter: item.chapter, heading: `Tags To Do for: ${item.chapter}` }))
													return [
														topicsToDo,
														tagsToDo
													]
												})
													.map((item, index) => (
														item.map(task => (
															<CarouselItem key={index + task[index].chapter + task[index].heading}>
																<EnhancedCard>
																	<CardHeader>
																		<CardTitle>
																			<h3 className='w-full text-center text-2xl/5 font-black capitalize'>
																				{task[index].heading}</h3>
																		</CardTitle>
																	</CardHeader>
																	<CardContent className="flex aspect-square items-center justify-center p-6 flex-col gap-3 px-7">
																		{
																			task.map(todo => (
																				<Badge className='text-xl' key={todo.task} variant="ghost">{todo.task}</Badge>
																			))
																		}
																	</CardContent>
																</EnhancedCard>
															</CarouselItem>
														))
													)
													)

												}
											</CarouselContent>
											<CarouselPrevious />
											<CarouselNext />
										</Carousel>
									</CardContent>
								</EnhancedCard>
							</CardContent>
						</EnhancedCard>
					</div>
				)}
			</section>
		</main>
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

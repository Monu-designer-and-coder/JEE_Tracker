/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { axiosConfig } from '@/config/axios.config';
import { cn } from '@/lib/utils';
import { chapterValidationPUTSchema } from '@/schema/chapter.schema';
import { getSubjectWiseChapterResponse } from '@/types/res/chapterResponse.types';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosResponse } from 'axios';
import { ChevronDownIcon, DotIcon } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import z from 'zod';

export default function SyllabusHomePage() {
	// ! HYDRATION & STATE MANAGEMENT
	// * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
	const [isMounted, setIsMounted] = useState(false);
	const [isLoading, setIsLoading] = useState<boolean>(true);
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

	// ! SIDE EFFECTS
	useEffect(() => {
		setIsMounted(true);
		setIsLoading(false);
		axios
			.request(axiosConfig('syllabus/chapter?type=subjectWise', 'get'))
			.then((response: AxiosResponse<getSubjectWiseChapterResponse[]>) => {
				setChapterList(response.data);
			});
	}, []);

	// * Memoized Axios Configuration - Performance optimization
	const axiosConfigHook = useMemo(
		() =>
			axiosConfig('syllabus/chapter', 'put', {
				'Content-Type': 'application/json',
			}),
		[],
	);

	type chapterCreateFormValidationPUTSchemaType = z.infer<
		typeof chapterValidationPUTSchema
	>;

	const handleChapterSelect = (input: { e: string; subjectIndex: number }) => {
		const chapterIndex = Number(input.e.split(',')[1]) || 0;
		chapterEditForm.setValue(
			'_id',
			`${String(chapterIndex)},${String(input.subjectIndex)}`,
		);
		const chapterSelected =
			chapterList[input.subjectIndex].chapterList[chapterIndex];
		chapterEditForm.setValue('data.Book', chapterSelected.Book);
		chapterEditForm.setValue('data.theory', chapterSelected.theory);
		chapterEditForm.setValue('data.Module', chapterSelected.Module);
		chapterEditForm.setValue('data.DPP1', chapterSelected.DPP1);
		chapterEditForm.setValue('data.DPP2', chapterSelected.DPP2);
		chapterEditForm.setValue('data.done', chapterSelected.done);
		chapterEditForm.setValue('data.shortNotes', chapterSelected.shortNotes);
		chapterEditForm.setValue('data.mindMap', chapterSelected.mindMap);
		chapterEditForm.setValue('data.PYQ_Mains', chapterSelected.PYQ_Mains);
		chapterEditForm.setValue('data.PYQ_Advanced', chapterSelected.PYQ_Advanced);
		toast.info(
			chapterList[input.subjectIndex].chapterList[chapterIndex].seqNumber +
				'.' +
				chapterList[input.subjectIndex].chapterList[chapterIndex].name,
		);
	};

	const chapterEditForm = useForm<chapterCreateFormValidationPUTSchemaType>({
		resolver: zodResolver(chapterValidationPUTSchema),
		defaultValues: {
			_id: '',
			data: {},
		},
		mode: 'onChange',
	});

	// * Enhanced Chapter Submit Handler with Improved Logic
	const handleChapterEditSubmit = useCallback(
		async (values: chapterCreateFormValidationPUTSchemaType) => {
			try {
				const chapterIndex = Number(values._id.split(',')[0]);
				const subjectIndex = Number(values._id.split(',')[1]);
				const dataToUpdate = {
					_id: chapterList[subjectIndex].chapterList[chapterIndex]._id,
					data: chapterList[subjectIndex].chapterList[chapterIndex],
				};

				// 1. Initialize the new values object with the _id from dataToUpdate
				const result: chapterCreateFormValidationPUTSchemaType = {
					_id: dataToUpdate._id,
					data: {},
				};

				if (values.data['done'] !== dataToUpdate.data['done']) {
					result.data['done'] = values.data['done'];
				}
				if (values.data['theory'] !== dataToUpdate.data['theory']) {
					result.data['theory'] = values.data['theory'];
				}
				if (values.data['shortNotes'] !== dataToUpdate.data['shortNotes']) {
					result.data['shortNotes'] = values.data['shortNotes'];
				}
				if (values.data['mindMap'] !== dataToUpdate.data['mindMap']) {
					result.data['mindMap'] = values.data['mindMap'];
				}
				if (values.data['DPP1'] !== dataToUpdate.data['DPP1']) {
					result.data['DPP1'] = values.data['DPP1'];
				}
				if (values.data['DPP2'] !== dataToUpdate.data['DPP2']) {
					result.data['DPP2'] = values.data['DPP2'];
				}
				if (values.data['Module'] !== dataToUpdate.data['Module']) {
					result.data['Module'] = values.data['Module'];
				}
				if (values.data['PYQ_Mains'] !== dataToUpdate.data['PYQ_Mains']) {
					result.data['PYQ_Mains'] = values.data['PYQ_Mains'];
				}
				if (values.data['PYQ_Advanced'] !== dataToUpdate.data['PYQ_Advanced']) {
					result.data['PYQ_Advanced'] = values.data['PYQ_Advanced'];
				}
				if (values.data['Book'] !== dataToUpdate.data['Book']) {
					result.data['Book'] = values.data['Book'];
				}

				console.log(result);

				const config = {
					...axiosConfigHook,
					data: { ...result },
				};
				const response = await axios.request(config);
				axios
					.request(axiosConfig('syllabus/chapter?type=subjectWise', 'get'))
					.then((response: AxiosResponse<getSubjectWiseChapterResponse[]>) => {
						setChapterList(response.data);
					});
				console.log('Chapter created successfully:', response.data);
				toast.success(`'Updated Chapter Successfully'`);
			} catch (error: any) {
				const ErrorMessage = error?.response?.data.message || 'Error';
				toast.error(ErrorMessage);
			}
		},
		[axiosConfigHook, chapterList],
	);

	// ! HYDRATION FALLBACK
	// * Render a skeleton or empty wrapper before client hydration to ensure exact HTML matching
	if (!isMounted) {
		return (
			<div className='min-h-100 w-full animate-pulse rounded-[2rem] bg-accent/20 mx-auto max-w-5xl mt-8' />
		);
	}

	return (
		<main className='relative min-h-[80vh] w-full overflow-auto bg-background px-4 py-8 md:px-8'>
			{/* * Ambient Background Effects (Aceternity / Minimalist styling) */}
			<div className='pointer-events-none absolute inset-0 z-0 overflow-hidden'>
				<div className='absolute -left-[10%] top-[20%] h-125 w-125 rounded-full bg-primary/10 blur-[120px] mix-blend-screen' />
				<div className='absolute right-[5%] top-[10%] h-100 w-100 rounded-full bg-blue-500/10 blur-[100px] mix-blend-screen' />
			</div>

			{/* * Content Section */}
			<section className='relative z-10 mx-auto max-w-7xl h-[80vh] flex flex-col justify-center'>
				{isLoading ? (
					// * Loading State
					<div className='flex h-64 items-center justify-center'>
						<div className='h-8 w-8 animate-spin rounded-full border-b-2 border-primary' />
					</div>
				) : (
					<section className='w-full h-full'>
						<header className='flex justify-between w-full px-4 py-2'>
							<Breadcrumb className='w-full'>
								<BreadcrumbList>
									<BreadcrumbItem>
										<BreadcrumbLink asChild>
											<Link href={'/'}>Home</Link>
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator>
										<DotIcon />
									</BreadcrumbSeparator>
									<BreadcrumbItem>
										<BreadcrumbLink asChild>
											<Link href={'/syllabus'}>Syllabus</Link>
										</BreadcrumbLink>
									</BreadcrumbItem>
									<BreadcrumbSeparator>
										<DotIcon />
									</BreadcrumbSeparator>

									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<button className='flex items-center gap-1'>
												Chapter
												<ChevronDownIcon className='size-3.5' />
											</button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align='start'>
											<DropdownMenuGroup>
												<DropdownMenuItem>
													<BreadcrumbLink className='w-full h-full' asChild>
														<Link href={'/syllabus/chapter'}>...</Link>
													</BreadcrumbLink>
												</DropdownMenuItem>
												<DropdownMenuItem>
													<BreadcrumbPage>Edit</BreadcrumbPage>
												</DropdownMenuItem>
												<DropdownMenuItem>
													<BreadcrumbLink className='w-full h-full' asChild>
														<Link href={'/syllabus/chapter/add'}>Add</Link>
													</BreadcrumbLink>
												</DropdownMenuItem>
												<DropdownMenuItem>Delete</DropdownMenuItem>
											</DropdownMenuGroup>
										</DropdownMenuContent>
									</DropdownMenu>
									<BreadcrumbSeparator>
										<DotIcon />
									</BreadcrumbSeparator>
									<BreadcrumbItem>
										<BreadcrumbPage>Edit</BreadcrumbPage>
									</BreadcrumbItem>
								</BreadcrumbList>
							</Breadcrumb>
						</header>
						<section className='flex flex-1'>
							<EnhancedCard className='w-full h-full'>
								<CardHeader className='text-center pb-6'>
									<CardTitle className='text-2xl font-bold bg-linear-to-r from-chart-1 to-primary bg-clip-text text-transparent'>
										Edit Chapter
									</CardTitle>
									<CardDescription className='text-secondary-foreground'>
										Update the Chapter
									</CardDescription>
								</CardHeader>
								<CardContent>
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
											<EnhancedCard>
												<CardHeader>
													<CardTitle className='text-2xl font-bold bg-linear-to-r from-chart-1 to-primary bg-clip-text text-transparent capitalize'>
														Select Some Subject
													</CardTitle>
													<CardDescription className='text-secondary-foreground'>
														-------------------------------------------
													</CardDescription>
												</CardHeader>
											</EnhancedCard>
										</TabsContent>
										{chapterList.map((subject, subjectIndex) => (
											<TabsContent key={subject._id} value={subject.name}>
												<EnhancedCard className='w-full'>
													<CardHeader>
														<CardTitle className='text-2xl font-bold bg-linear-to-r from-chart-1 to-primary bg-clip-text text-transparent capitalize'>
															{subject.name}
														</CardTitle>
														<CardDescription className='text-secondary-foreground'>
															List of all the chapters of the subject{' '}
															{subject.name}
														</CardDescription>
													</CardHeader>
													<CardContent>
														<form
															onSubmit={chapterEditForm.handleSubmit(
																handleChapterEditSubmit,
															)}
															className='space-y-6'>
															<Controller
																control={chapterEditForm.control}
																name='_id'
																render={({ field }) => (
																	<Field>
																		<EnhancedInputContainer>
																			<FieldLabel className='text-sm font-semibold text-primary'>
																				Chapter
																			</FieldLabel>
																			<Select
																				onValueChange={(e) => {
																					handleChapterSelect({
																						e,
																						subjectIndex,
																					});
																				}}
																				defaultValue={field.value}>
																				<SelectTrigger className='glass-select w-full'>
																					<SelectValue placeholder='Select the subject for this chapter' />
																				</SelectTrigger>
																				<SelectContent className='glass-content'>
																					{subject.chapterList.map(
																						(chapter, chapterIndex) => (
																							<SelectItem
																								key={
																									chapter.seqNumber +
																									'-' +
																									chapter.name
																								}
																								value={
																									chapter._id +
																									',' +
																									chapterIndex
																								}
																								className='hover:bg-primary'>
																								{chapter.name}
																							</SelectItem>
																						),
																					)}
																				</SelectContent>
																			</Select>
																		</EnhancedInputContainer>
																		<FieldDescription className='text-xs text-secondary-foreground'>
																			Select the chapter.
																		</FieldDescription>
																		<FieldError />
																	</Field>
																)}
															/>
															{/* Progress Checkboxes */}
															<div className='grid grid-cols-2 md:grid-cols-5 gap-4'>
																{[
																	'done',
																	'theory',
																	'shortNotes',
																	'mindMap',
																	'DPP1',
																	'DPP2',
																	'Module',
																	'PYQ_Mains',
																	'PYQ_Advanced',
																	'Book',
																].map((field, index) => (
																	<EnhancedCheckboxField
																		key={index}
																		control={chapterEditForm.control}
																		name={`data.${field}`}
																		label={field}
																		htmlID={
																			subject._id + `form-${field}-checkbox`
																		}
																	/>
																))}
															</div>
															<Button
																type='submit'
																className='w-full bg-linear-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]'>
																Update Chapter
															</Button>
														</form>
													</CardContent>
												</EnhancedCard>
											</TabsContent>
										))}
									</Tabs>
								</CardContent>
							</EnhancedCard>
						</section>
					</section>
				)}
			</section>
		</main>
	);
}

// * Enhanced Input Container Component with Glass Morphism
const EnhancedInputContainer = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div
			className={cn(
				'flex w-full flex-col space-y-3 group',
				'transition-all duration-300',
				className,
			)}>
			{children}
		</div>
	);
};

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
				'shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/20',
				'rounded-2xl overflow-hidden',
				'transition-all duration-500 hover:shadow-3xl hover:shadow-blue-500/20',
				'hover:bg-white/50 dark:hover:bg-black/30',
				className,
			)}>
			{children}
		</Card>
	);
};

// * Enhanced Checkbox Field Component with Modern Styling
const EnhancedCheckboxField = ({
	control,
	name,
	label,
	htmlID,
}: {
	control: any;
	name: string;
	label: string;
	htmlID: string;
}) => {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => (
				<Field className='space-y-2'>
					<div className='flex items-center space-x-3 p-3 rounded-xl bg-white/20 dark:bg-black/20 border border-white/20 hover:bg-white/30 dark:hover:bg-black/30 transition-all duration-300 group'>
						<Checkbox
							id={htmlID}
							checked={field.value}
							onCheckedChange={field.onChange}
							className='enhanced-checkbox data-[state=checked]:bg-primary data-[state=checked]:border-primary border-2 border-slate-300 dark:border-slate-600'
						/>
						<FieldLabel
							className='text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer group-hover:text-primary dark:group-hover:text-chart-1 transition-colors duration-300 capitalize'
							htmlFor={htmlID}>
							{label}
						</FieldLabel>
					</div>
					<FieldError />
				</Field>
			)}
		/>
	);
};

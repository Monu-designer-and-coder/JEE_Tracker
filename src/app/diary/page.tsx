/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';

// * 1. Third-party & React imports
import {
	useState,
	useEffect,
	useMemo,
	HTMLInputTypeAttribute,
	useCallback,
} from 'react';

// * 3. Configuration Imports
import { Skeleton } from '@/components/ui/skeleton';
import { Container } from '@/components/base/Container.base.component';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Controller, useForm } from 'react-hook-form';
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from '@/components/ui/field';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { axiosConfig } from '@/config/axios.config';
import { todoPostSchema } from '@/schema/to-do.schema';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import axios, { AxiosResponse } from 'axios';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { todaysTasksList } from '@/types/res/todoResponse.types';
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemHeader,
	ItemTitle,
} from '@/components/ui/item';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';

export default function Home() {
	// ! HYDRATION & STATE MANAGEMENT
	// * Use a single 'mounted' state to prevent React hydration mismatch errors on time-based UI
	const [isMounted, setIsMounted] = useState(false);

	function fetchTodaysTask() {
		axios
			.request(axiosConfig('todo?type=today', 'get'))
			.then((res: AxiosResponse<todaysTasksList[]>) => {
				setTodaysTaskList(res.data);
				console.log(res.data);
			});
	}

	const [todaysTaskList, setTodaysTaskList] = useState<todaysTasksList[]>([]);

	// ! SIDE EFFECTS
	useEffect(() => {
		setIsMounted(true);
		fetchTodaysTask();
	}, []);

	// * Memoized Axios Configuration - Performance optimization
	const AddTopicAxiosConfigHook = useMemo(
		() =>
			axiosConfig('todo', 'post', {
				'Content-Type': 'application/json',
			}),
		[],
	);

	// * Enhanced Chapter Form with Improved Validation

	type todoCreateFormValidationSchemaType = z.infer<typeof todoPostSchema>;

	const todoCreateForm = useForm<todoCreateFormValidationSchemaType>({
		resolver: zodResolver(todoPostSchema),
		defaultValues: {
			category: 'skillful',
			todo: '',
			perceivedDifficulty: '0',
			worthPoints: '0',
		},
		mode: 'onChange',
	});

	// * Enhanced Chapter Submit Handler with Improved Logic
	const handleTopicCreateSubmit = useCallback(
		async (values: todoCreateFormValidationSchemaType) => {
			try {
				const config = {
					...AddTopicAxiosConfigHook,
					data: {
						...values,
						perceivedDifficulty: Number(values.perceivedDifficulty),
						worthPoints: Number(values.worthPoints),
					},
				};
				axios.request(config).then((response) => {
					console.log(response.data);
					toast.success('Todo added successfully:');
					axios
						.request(axiosConfig('todo?type=today', 'get'))
						.then((res: AxiosResponse<todaysTasksList[]>) => {
							setTodaysTaskList(res.data);
						});
				});

				// * Smart form reset - keep all data except name and increment seqNumber
				todoCreateForm.setValue('todo', '');
				todoCreateForm.setValue('perceivedDifficulty', '0');
				todoCreateForm.setValue('worthPoints', '0');
			} catch (error: any) {
				const ErrorMessage = error?.response?.data || 'Error';
				toast.error(ErrorMessage);
			}
		},
		[AddTopicAxiosConfigHook, todoCreateForm, setTodaysTaskList],
	);

	const todoCategoriesItemList = [
		{ label: 'Chores', value: 'chores' },
		{ label: 'Be Fit', value: 'fitness' },
		{ label: 'Be Intellectual', value: 'intelligent' },
		{ label: 'Crack IIT BOMBAY', value: 'JEE_IIT_Bombay' },
		{ label: 'BE extremely skillful', value: 'skillful' },
	];

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
		<Container className='w-full grid p-6 gap-3 grid-cols-12'>
			<Card className='w-full col-span-6'>
				<CardHeader>
					<CardTitle>Today</CardTitle>
					<CardDescription>
						List of all the task to be done today.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Container className='flex flex-col gap-3'>
						{todaysTaskList.map((todo) => (
							<Item
								key={todo._id}
								variant={todo.done ? 'muted' : 'outline'}
								onClick={() => {
									setTodaysTaskList((prev) => {
										return prev.map((item) => {
											if (item._id == todo._id) {
												axios
													.request(
														axiosConfig(
															'todo',
															'put',
															{
																'Content-Type': 'application/json',
															},
															{
																todoId: item._id,
																action: item.done ? 'undone' : 'done',
															},
														),
													)
													.then(() => {})
													.catch((err) => console.log({ err }));
												return { ...item, done: !item.done };
											} else {
												return item;
											}
										});
									});
								}}>
								<ItemHeader className='text-foreground/30'>
									Perceived Difficulty: {todo.perceivedDifficulty}
								</ItemHeader>
								<ItemContent>
									<ItemTitle
										className={cn(
											'capitalize',
											todo.done ? 'line-through' : '',
										)}>
										{todo.todo}
									</ItemTitle>
									<ItemDescription>Category: {todo.category}</ItemDescription>
								</ItemContent>
								<ItemActions>
									<Badge>Points: {todo.worthPoints}</Badge>
									<Checkbox checked={todo.done} />
								</ItemActions>
							</Item>
						))}
					</Container>
				</CardContent>
			</Card>
			<Card className='w-full col-span-6'>
				<CardHeader>
					<CardTitle>Add</CardTitle>
					<CardDescription>Sets tasks for today.</CardDescription>
				</CardHeader>
				<CardContent>
					<Card>
						<CardContent>
							<form
								onSubmit={todoCreateForm.handleSubmit(handleTopicCreateSubmit)}>
								<CustomInputController
									label='Enter Todo'
									type='text'
									control={todoCreateForm.control}
									name='todo'
									description='Enter the Topic Name'
									htmlID='TODO'
									placeholder='E.g. Study Maths at study table'
								/>
								<Controller
									control={todoCreateForm.control}
									name={'category'}
									render={({ field }) => (
										<Field className='my-5 border border-primary/20 bg-primary/5 py-4 px-5 rounded-4xl'>
											<div className={cn('')}>
												<FieldLabel
													htmlFor={'CATEGORY'}
													className={cn(
														'text-base font-content-primary font-semibold text-primary',
													)}>
													{'Select The Todo Category'}
												</FieldLabel>
												<Select
													// value={todoCreateForm.getValues('category')}
													onValueChange={(
														e:
															| 'JEE_IIT_Bombay'
															| 'fitness'
															| 'intelligent'
															| 'skillful'
															| 'chores',
													) => {
														todoCreateForm.setValue('category', e);
													}}
													{...field}>
													<SelectTrigger className='w-full'>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectGroup>
															<SelectLabel>Categories</SelectLabel>
															{todoCategoriesItemList.map((item) => (
																<SelectItem key={item.value} value={item.value}>
																	{item.label}
																</SelectItem>
															))}
														</SelectGroup>
													</SelectContent>
												</Select>
											</div>
											<FieldDescription
												className={cn('text-sm text-foreground/40')}>
												{'Choose the category of the todo.'}
											</FieldDescription>
											<FieldError />
										</Field>
									)}
								/>
								<CustomInputController
									label='Enter Perceived Difficulty. OUT OF 10'
									type='number'
									control={todoCreateForm.control}
									name='perceivedDifficulty'
									description='Enter the Topic Name'
									htmlID='PERCEIVED_DIFFICULTY'
									placeholder='E.g. Study Maths at study table'
								/>
								<CustomInputController
									label='Enter Points the todo deserves.'
									type='number'
									control={todoCreateForm.control}
									name='worthPoints'
									description='Enter the Topic Name'
									htmlID='WORTH_POINTS'
									placeholder='E.g. Study Maths at study table'
								/>
								<Button type='submit' className='w-full bg-primary/20'>
									Create Topic
								</Button>
							</form>
						</CardContent>
					</Card>
				</CardContent>
			</Card>
		</Container>
	);
}
const CustomInputController = ({
	className,
	containerClassName,
	descriptionClassName,
	labelClassName,
	control,
	name,
	label,
	description,
	htmlID,
	type = 'text',
	placeholder,
}: {
	className?: string;
	containerClassName?: string;
	descriptionClassName?: string;
	labelClassName?: string;
	control: any;
	name: string;
	label: string;
	description: string;
	htmlID: string;
	type: HTMLInputTypeAttribute;
	placeholder: string;
}) => {
	return (
		<Controller
			control={control}
			name={name}
			render={({ field }) => (
				<Field className='my-5 border border-primary/20 bg-primary/5 py-4 px-5 rounded-4xl'>
					<div className={cn('', containerClassName)}>
						<FieldLabel
							htmlFor={htmlID}
							className={cn(
								'text-base font-content-primary font-semibold text-primary',
								labelClassName,
							)}>
							{label}
						</FieldLabel>
						<Input
							id={htmlID}
							type={type}
							placeholder={placeholder}
							autoComplete='on'
							className={cn('font-content-secondary', className)}
							{...field}
						/>
					</div>
					<FieldDescription
						className={cn('text-sm text-foreground/40', descriptionClassName)}>
						{description}
					</FieldDescription>
					<FieldError />
				</Field>
			)}
		/>
	);
};

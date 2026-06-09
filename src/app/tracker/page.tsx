'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { axiosConfig } from '@/config/axios.config';
import { getQuestionStreakTodayResponse } from '@/types/res/questionStreak.types';
import axios, { AxiosResponse } from 'axios';
import { useEffect, useState } from 'react';

export default function Tracker() {
	const [questionSteakList, setQuestionSteakList] = useState<
		getQuestionStreakTodayResponse[]
	>([
		{
			_id: '',
			date: '',
			questionsDone: 0,
			subject: {
				_id: '',
				name: 'subject',
			},
		},
	]);

	useEffect(() => {
		axios
			.request(axiosConfig('questionStreak?type=today', 'get'))
			.then((response: AxiosResponse<getQuestionStreakTodayResponse[]>) => {
				setQuestionSteakList(response.data);
			});
	}, []);

	function formatDate(dateText: string) {
		const d = new Date(dateText);
		const date = ` ${d.getDate()} / ${d.getMonth()} / ${d.getFullYear()}`;
		return date;
	}

	async function plusOneSteak(streakId: string, subjectId: string) {
		await axios.request(
			axiosConfig(
				'questionStreak',
				'put',
				{ 'Content-Type': 'application/json' },
				{ _id: streakId },
			),
		);
		const response: AxiosResponse<getQuestionStreakTodayResponse[]> =
			await axios.request(
				axiosConfig(`questionStreak?type=today&subjectId=${subjectId}`, 'get'),
			);
		const responseData = response.data[0];
		const merged = questionSteakList.map((item) =>
			item._id === responseData._id ? { ...item, ...responseData } : item,
		);
		setQuestionSteakList(merged);
	}

	return (
		<>
			<section className='flex items-center justify-center gap-4 w-full h-[80vh] px-4'>
				{questionSteakList.map((item) => (
					<Card
						key={item._id}
						className='w-1/3 mx-1 h-5/6 shadow-2xl mt-2'
						size='default'>
						<CardHeader>
							<Tooltip>
								<TooltipTrigger asChild>
									<Button className='capitalize' size={'lg'}>
										{item.subject.name}
									</Button>
								</TooltipTrigger>
								<TooltipContent>
									<h3 className='text-left text-md'>
										Today, Date: {formatDate(item.date)}
									</h3>
								</TooltipContent>
							</Tooltip>
						</CardHeader>
						<CardContent className='flex flex-col gap-3'>
							<div
								className='group relative overflow-hidden rounded-full bg-white/10 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white/5 hover:scale-105'
								onClick={() => plusOneSteak(item._id, item.subject._id)}>
								<div className='absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
								<div className='relative'>
									<div className='text-3xl font-bold md:text-4xl'>
										{item.questionsDone}
									</div>
									<div className='text-sm font-medium opacity-90'>
										Question Done Today
									</div>
								</div>
							</div>
							<div className='h-56 group relative overflow-hidden rounded-4xl bg-white/10 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white/5 hover:scale-105'>
								<div className='absolute inset-0 bg-linear-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
								<div className='relative'>
									<div className='text-3xl font-bold md:text-4xl'>
										0
									</div>
									<div className='text-sm font-medium opacity-90'>
										Hours Studied Today
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</section>
		</>
	);
}

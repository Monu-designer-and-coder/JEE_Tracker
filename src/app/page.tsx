'use client';
import {
	ClockTimeDetails,
	TARGET_DATE,
	TimeBreakdown,
	homePageConfig,
	START_DATE
} from '@/config/frontend/homePage.config';
import { Card, CardContent } from '@/components/ui/card';
import { useCallback, useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Home() {
	const [currentTimeDetails, setCurrentTimeDetails] =
		useState<ClockTimeDetails>({
			date: '',
			hours: 0,
			minutes: 0,
			seconds: 0,
		});
	const [timeRemainingPercentage, setTimeRemainingPercentage] =
		useState<number>(0);
	const [countdownTimeLeft, setCountdownTimeLeft] = useState<number>(
		TARGET_DATE.getTime(),
	);
	const [countdownBreakdown, setCountdownBreakdown] = useState<TimeBreakdown>({
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});

	const calculateRemainingTime = useCallback((): number => {
		const currentTime = new Date().getTime();
		const timeDifference = TARGET_DATE.getTime() - currentTime;
		return timeDifference > 0 ? timeDifference : 0;
	}, []);

	// ! SIDE EFFECTS AND LIFECYCLE
	/**
	 * * Countdown timer effect
	 * ? Updates countdown every 100ms for smooth animation
	 * * Cleanup: Clears interval on component unmount
	 */
	useEffect(() => {
		const updateCountdownTimer = (): void => {
			setCountdownTimeLeft(calculateRemainingTime());
		};

		// * Update timer more frequently for smoother countdown
		const timerInterval = setInterval(updateCountdownTimer, 100);

		return () => clearInterval(timerInterval);
	}, [calculateRemainingTime]);

	/**
	 * * Time details calculation effect
	 * ? Updates countdown breakdown and current time display
	 * * Triggers whenever countdownTimeLeft changes
	 */
	useEffect(() => {
		// * Calculate countdown breakdown
		const timeBreakdown: TimeBreakdown = {
			days: Math.floor(countdownTimeLeft / (1000 * 60 * 60 * 24)),
			hours: Math.floor(
				(countdownTimeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
			),
			minutes: Math.floor((countdownTimeLeft % (1000 * 60 * 60)) / (1000 * 60)),
			seconds: Math.floor((countdownTimeLeft % (1000 * 60)) / 1000),
		};
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setCountdownBreakdown(timeBreakdown);

		// * Update current time display
		const currentDate = new Date();
		const currentTimeData: ClockTimeDetails = {
			date: `${currentDate.getDate()}/${
				currentDate.getMonth() + 1
			}/${currentDate.getFullYear()}`,
			hours: currentDate.getHours(),
			minutes: currentDate.getMinutes(),
			seconds: currentDate.getSeconds(),
		};
		setCurrentTimeDetails(currentTimeData);
	}, [countdownTimeLeft]);


	useEffect(()=>{
				// * Calculate time remaining percentage
		const calculateTimePercentage = (): void => {
			const currentTime = new Date().getTime();
			const totalTimeSpan = TARGET_DATE.getTime() - START_DATE.getTime();
			const timeRemaining = TARGET_DATE.getTime() - currentTime;

			if (timeRemaining <= 0) {
				setTimeRemainingPercentage(0);
				return;
			}

			const percentageRemaining = (timeRemaining / totalTimeSpan) * 100;
			setTimeRemainingPercentage(percentageRemaining);
		};

		calculateTimePercentage();
	},[])


	return (
		<>
			<Card className='overflow-hidden border-0 text-white shadow-2xl mx-5 mt-2'>
				<CardContent className='p-6'>
					<div className='mb-6 flex items-center justify-between'>
						<h2 className='flex items-center gap-2 text-xl font-semibold'>
							<Clock className='h-5 w-5' />
							Time Remaining
						</h2>
						<Badge
							variant='secondary'
							className='bg-white/20 text-white hover:bg-white/30'>
							{Math.round(100 - timeRemainingPercentage)}% elapsed
						</Badge>
					</div>

					<div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
						{/* * Days Counter */}
						<div className='group relative overflow-hidden rounded-2xl bg-white/10 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105'>
							<div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
							<div className='relative'>
								<div className='text-3xl font-bold md:text-4xl'>
									{countdownBreakdown.days}
								</div>
								<div className='text-sm font-medium opacity-90'>Days</div>
								<div className='mt-1 text-xs opacity-70'>
									of {homePageConfig.TOTAL_DAYS} total
								</div>
							</div>
						</div>

						{/* * Hours Counter */}
						<div className='group relative overflow-hidden rounded-2xl bg-white/10 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105'>
							<div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
							<div className='relative'>
								<div className='text-3xl font-bold md:text-4xl'>
									{String(countdownBreakdown.hours).padStart(2, '0')}
								</div>
								<div className='text-sm font-medium opacity-90'>Hours</div>
								<div className='mt-1 text-xs opacity-70'>
									{countdownBreakdown.days * 24 + countdownBreakdown.hours}{' '}
									total left
								</div>
							</div>
						</div>

						{/* * Minutes Counter */}
						<div className='group relative overflow-hidden rounded-2xl bg-white/10 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105'>
							<div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
							<div className='relative'>
								<div className='text-3xl font-bold md:text-4xl'>
									{String(countdownBreakdown.minutes).padStart(2, '0')}
								</div>
								<div className='text-sm font-medium opacity-90'>Minutes</div>
							</div>
						</div>

						{/* * Seconds Counter */}
						<div className='group relative overflow-hidden rounded-2xl bg-white/10 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105'>
							<div className='absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100' />
							<div className='relative'>
								<div className='text-3xl font-bold md:text-4xl'>
									{String(countdownBreakdown.seconds).padStart(2, '0')}
								</div>
								<div className='text-sm font-medium opacity-90'>Seconds</div>
							</div>
						</div>
					</div>

					{/* * Overall Progress Bar */}
					<div className='mt-6 space-y-2'>
						<div className='flex justify-between text-sm'>
							<span>Overall Time Passed</span>
							<span>{Math.round(100 - timeRemainingPercentage)}%</span>
						</div>
						<Progress
							value={100 - timeRemainingPercentage}
							className='h-3'
						/>
					</div>
				</CardContent>
			</Card>
		</>
	);
}

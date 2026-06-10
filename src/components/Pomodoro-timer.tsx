'use client';

// ! REACT & NEXT.JS IMPORTS
import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
	useMemo,
} from 'react';

// ! SHADCN UI COMPONENTS
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// ! ICONS
import {
	Play,
	Pause,
	RotateCcw,
	Coffee,
	Timer,
	Zap,
	Target,
	Settings,
	Minimize,
	Maximize,
	Keyboard,
} from 'lucide-react';

// ! UTILITIES
import { cn } from '@/lib/utils';

// ! TYPE DEFINITIONS
/**
 * * Timer mode types for type safety
 * ? Defines the three possible states of the Pomodoro timer
 */
type TimerMode = 'work' | 'shortBreak' | 'longBreak';

/**
 * * Timer size options for responsive design
 * ? Provides predefined sizes or custom sizing capability
 */
type TimerSize = 'sm' | 'md' | 'lg' | 'xl' | 'custom';

/**
 * * Time structure interface
 * ? Standardizes time representation throughout the component
 */
interface TimeRemaining {
	minutes: number;
	seconds: number;
}

/**
 * * Component props interface with comprehensive options
 * ? Provides flexible configuration for different use cases
 */
interface PomodoroTimerProps {
	initialWorkDuration?: number;
	initialShortBreakDuration?: number;
	initialLongBreakDuration?: number;
	size?: TimerSize;
	customSize?: string;
	autoStartBreaks?: boolean;
	enableNotifications?: boolean;
	className?: string;
}

/**
 * * Timer configuration interface
 * ? Centralizes timer settings for better maintainability
 */
interface TimerConfiguration {
	work: number;
	shortBreak: number;
	longBreak: number;
}

// ! CONSTANTS
/**
 * * Default timer durations in minutes
 * ? Standard Pomodoro technique timings
 */
const DEFAULT_DURATIONS: TimerConfiguration = {
	work: 45,
	shortBreak: 5,
	longBreak: 15,
} as const;

/**
 * * Timer size configuration mapping
 * ? Predefined responsive sizes with consistent design
 */
const TIMER_SIZE_CLASSES: Record<TimerSize, string> = {
	sm: 'w-32 h-32 text-2xl',
	md: 'w-48 h-48 text-4xl',
	lg: 'w-64 h-64 text-6xl',
	xl: 'w-80 h-80 text-8xl',
	custom: '', // * Will be overridden by customSize prop
} as const;

/**
 * * Mode configuration with enhanced metadata
 * ? Provides comprehensive information for each timer mode
 */
const MODE_CONFIGURATION = {
	work: {
		label: 'Focus Time',
		icon: Target,
		bgGradient: 'from-blue-500 to-indigo-600',
		borderColor: 'border-blue-500',
		textColor: 'text-blue-600',
		description: 'Time to focus and get work done',
		fullscreenBg:
			'bg-linear-to-br from-blue-900/20 via-indigo-900/10 to-purple-900/20',
		glowColor: 'shadow-blue-500/50',
	},
	shortBreak: {
		label: 'Short Break',
		icon: Coffee,
		bgGradient: 'from-green-500 to-emerald-600',
		borderColor: 'border-green-500',
		textColor: 'text-green-600',
		description: 'Quick break to refresh your mind',
		fullscreenBg:
			'bg-linear-to-br from-green-900/20 via-emerald-900/10 to-teal-900/20',
		glowColor: 'shadow-green-500/50',
	},
	longBreak: {
		label: 'Long Break',
		icon: Timer,
		bgGradient: 'from-purple-500 to-pink-600',
		borderColor: 'border-purple-500',
		textColor: 'text-purple-600',
		description: 'Extended break for deeper rest',
		fullscreenBg:
			'bg-linear-to-br from-purple-900/20 via-pink-900/10 to-rose-900/20',
		glowColor: 'shadow-purple-500/50',
	},
} as const;


// ! MAIN COMPONENT
/**
 * * Enhanced Pomodoro Timer Component
 * ? Modern, feature-rich timer following the Pomodoro Technique with fullscreen support
 * * Features:
 ** - Customizable durations for all timer modes
 ** - Visual progress indication with circular progress
 ** - Responsive design with multiple size options
 ** - Smooth animations and transitions
 ** - Auto-progression between modes
 ** - Fullscreen focus mode with dramatic UI
 ** - Keyboard shortcuts support
 ** - Enhanced animations and visual effects
 ** * @param props - Component configuration options
 * @returns JSX element containing the complete timer interface
 */
const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
	initialWorkDuration = DEFAULT_DURATIONS.work,
	initialShortBreakDuration = DEFAULT_DURATIONS.shortBreak,
	initialLongBreakDuration = DEFAULT_DURATIONS.longBreak,
	size = 'lg',
	customSize = 'w-64 h-64 text-6xl',
	autoStartBreaks = false,
	enableNotifications = true,
	className = '',
}) => {
	// ! STATE MANAGEMENT
	/**
	 * * Timer configuration state
	 * ? Manages customizable durations for all timer modes
	 */
	const [timerConfiguration, setTimerConfiguration] =
		useState<TimerConfiguration>({
			work: initialWorkDuration,
			shortBreak: initialShortBreakDuration,
			longBreak: initialLongBreakDuration,
		});

	/**
	 * * Current timer mode state
	 * ? Tracks which type of session is currently active
	 */
	const [currentTimerMode, setCurrentTimerMode] = useState<TimerMode>('work');

	/**
	 * * Remaining time state
	 * ? Stores current countdown time in minutes and seconds
	 */
	const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
		minutes: initialWorkDuration,
		seconds: 0,
	});

	/**
	 * * Timer activity state
	 * ? Controls whether the countdown is currently running
	 */
	const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

	/**
	 * * Settings visibility state
	 * ? Controls the display of duration configuration inputs
	 */
	const [areSettingsVisible, setAreSettingsVisible] = useState<boolean>(false);

	/**
	 * * Session tracking state
	 * ? Counts completed work sessions for progress tracking
	 */
	const [completedWorkSessions, setCompletedWorkSessions] = useState<number>(0);

	/**
	 * * Focus mode state
	 * ? Controls fullscreen focus mode
	 */
	const [isFocusMode, setIsFocusMode] = useState<boolean>(false);

	/**
	 * * Keyboard shortcuts help visibility
	 * ? Controls display of keyboard shortcuts help
	 */
	const [showKeyboardHelp, setShowKeyboardHelp] = useState<boolean>(false);

	// ! REFS
	/**
	 * * Interval reference for timer cleanup
	 * ? Prevents memory leaks by storing interval ID
	 */
	const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

	/**
	 * * Initial duration reference for progress calculation
	 * ? Stores the starting duration for percentage calculations
	 */
	const initialTimerDuration = useRef<number>(initialWorkDuration);

	/**
	 * * Focus container reference for fullscreen
	 * ? Reference to the element to put in fullscreen
	 */
	const focusContainerRef = useRef<HTMLDivElement>(null);

	// ! MEMOIZED VALUES
	/**
	 * * Current mode configuration
	 * ? Optimizes rendering by computing mode data only when mode changes
	 */
	const currentModeConfig = useMemo(
		() => MODE_CONFIGURATION[currentTimerMode],
		[currentTimerMode],
	);

	/**
	 * * Timer progress percentage
	 * ? Calculates completion percentage for visual progress indicators
	 */
	const timerProgressPercentage = useMemo(() => {
		const totalSecondsRemaining =
			timeRemaining.minutes * 60 + timeRemaining.seconds;
		const initialTotalSeconds = initialTimerDuration.current * 60;

		if (initialTotalSeconds === 0) return 0;

		const progressValue =
			((initialTotalSeconds - totalSecondsRemaining) / initialTotalSeconds) *
			100;
		return Math.min(Math.max(progressValue, 0), 100);
	}, [timeRemaining]);

	/**
	 * * Timer size classes
	 * ? Determines CSS classes based on size prop and focus mode
	 */
	const timerSizeClasses = useMemo(() => {
		const baseClasses =
			size === 'custom' ? customSize : TIMER_SIZE_CLASSES[size];
		return cn(
			baseClasses,
			isFocusMode &&
				'w-96 h-96 text-9xl md:w-[500px] md:h-[500px] md:text-[8rem] lg:w-[600px] lg:h-[600px] lg:text-[10rem]',
		);
	}, [size, customSize, isFocusMode]);

	// ! CALLBACK FUNCTIONS
	/**
	 * * Get duration for specific timer mode
	 * ? Centralized function to retrieve mode-specific durations
	 * @param mode - The timer mode to get duration for
	 * @returns Duration in minutes for the specified mode
	 */
	const getTimerDurationForMode = useCallback(
		(mode: TimerMode): number => {
			return timerConfiguration[mode];
		},
		[timerConfiguration],
	);

	/**
	 * * Reset timer to specified mode duration
	 * ? Comprehensive timer reset with proper cleanup
	 * @param targetMode - Optional mode to reset to (defaults to current mode)
	 */
	const resetTimerToMode = useCallback(
		(targetMode?: TimerMode): void => {
			const modeToReset = targetMode || currentTimerMode;
			const duration = getTimerDurationForMode(modeToReset);

			// * Stop any running timer
			setIsTimerActive(false);

			// * Clear existing interval
			if (timerIntervalRef.current) {
				clearInterval(timerIntervalRef.current);
				timerIntervalRef.current = null;
			}

			// * Reset time and duration reference
			setTimeRemaining({ minutes: duration, seconds: 0 });
			initialTimerDuration.current = duration;
		},
		[currentTimerMode, getTimerDurationForMode],
	);

	/**
	 * * Handle timer completion
	 * ? Manages automatic progression and notifications
	 */
	const handleTimerCompletion = useCallback(() => {
		// * Stop current timer
		setIsTimerActive(false);

		// * Update session count for work completions
		if (currentTimerMode === 'work') {
			setCompletedWorkSessions((prev) => prev + 1);
		}

		// * Determine next mode based on current mode and session count
		let nextMode: TimerMode;
		if (currentTimerMode === 'work') {
			// * After work session, determine break type
			nextMode =
				(completedWorkSessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
		} else {
			// * After any break, return to work
			nextMode = 'work';
		}

		// * Show notification if enabled
		if (enableNotifications && 'Notification' in window) {
			new Notification('Pomodoro Timer', {
				body: `${currentModeConfig.label} completed! Time for ${MODE_CONFIGURATION[nextMode].label}.`,
				icon: '/favicon.ico',
			});
		}

		// * Switch to next mode
		setCurrentTimerMode(nextMode);

		// * Auto-start next session if enabled
		if (autoStartBreaks && nextMode !== 'work') {
			setTimeout(() => setIsTimerActive(true), 1000);
		}
	}, [
		currentTimerMode,
		completedWorkSessions,
		enableNotifications,
		autoStartBreaks,
		currentModeConfig,
	]);

	/**
	 * * Toggle timer start/pause state
	 * ? Handles timer activation with proper validation
	 */
	const toggleTimerState = useCallback((): void => {
		// * If timer is at zero, reset before starting
		if (timeRemaining.minutes === 0 && timeRemaining.seconds === 0) {
			resetTimerToMode();
			return;
		}

		setIsTimerActive((prev) => !prev);
	}, [timeRemaining, resetTimerToMode]);

	/**
	 * * Update timer configuration for specific mode
	 * ? Handles duration updates with validation
	 * @param mode - Timer mode to update
	 * @param newDuration - New duration value in minutes
	 */
	const updateTimerDuration = useCallback(
		(mode: TimerMode, newDuration: number): void => {
			if (newDuration > 0 && newDuration <= 180) {
				// * Limit to 3 hours max
				setTimerConfiguration((prev) => ({
					...prev,
					[mode]: newDuration,
				}));

				// * If updating current mode, reset timer
				if (mode === currentTimerMode) {
					resetTimerToMode();
				}
			}
		},
		[currentTimerMode, resetTimerToMode],
	);

	/**
	 * * Toggle fullscreen mode
	 * ? Handles fullscreen API with error handling
	 */
	const toggleFullscreen = useCallback(() => {
		const element = focusContainerRef.current;
		if (!element) return;

		if (document.fullscreenElement) {
			document.exitFullscreen();
		} else {
			element.requestFullscreen().catch((err) => {
				console.error(
					`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`,
				);
			});
		}
	}, []);

	/**
	 * * Handle keyboard shortcuts
	 * ? Centralized keyboard event handler
	 */
	const handleKeyPress = useCallback(
		(event: KeyboardEvent) => {
			// Prevent shortcuts when typing in inputs
			if (event.target instanceof HTMLInputElement) return;

			const key = event.key.toLowerCase();
			const isSpace = event.code === 'Space';

			switch (true) {
				case isSpace:
					event.preventDefault();
					toggleTimerState();
					break;
				case key === 'r':
					event.preventDefault();
					resetTimerToMode();
					break;
				case key === 's':
					event.preventDefault();
					setAreSettingsVisible((prev) => !prev);
					break;
				case key === 'f':
					event.preventDefault();
					toggleFullscreen();
					break;
				case key === '1':
					event.preventDefault();
					setCurrentTimerMode('work');
					break;
				case key === '2':
					event.preventDefault();
					setCurrentTimerMode('shortBreak');
					break;
				case key === '3':
					event.preventDefault();
					setCurrentTimerMode('longBreak');
					break;
				case key === '?':
					event.preventDefault();
					setShowKeyboardHelp((prev) => !prev);
					break;
			}
		},
		[toggleTimerState, resetTimerToMode, toggleFullscreen],
	);

	// ! SIDE EFFECTS
	/**
	 * * Mode change effect
	 * ? Automatically resets timer when mode changes
	 */
	useEffect(() => {
		resetTimerToMode();
	}, [currentTimerMode, resetTimerToMode]);

	/**
	 * * Main timer countdown effect
	 * ? Manages the core timer functionality with proper cleanup
	 */
	useEffect(() => {
		if (isTimerActive) {
			timerIntervalRef.current = setInterval(() => {
				setTimeRemaining((prevTime) => {
					// * Check for timer completion
					if (prevTime.minutes === 0 && prevTime.seconds === 0) {
						handleTimerCompletion();
						return { minutes: 0, seconds: 0 };
					}

					// * Decrement time
					if (prevTime.seconds === 0) {
						return { minutes: prevTime.minutes - 1, seconds: 59 };
					} else {
						return { ...prevTime, seconds: prevTime.seconds - 1 };
					}
				});
			}, 1000);
		}

		// * Cleanup function
		return () => {
			if (timerIntervalRef.current) {
				clearInterval(timerIntervalRef.current);
				timerIntervalRef.current = null;
			}
		};
	}, [isTimerActive, handleTimerCompletion]);

	/**
	 * * Notification permission effect
	 * ? Requests notification permission on component mount
	 */
	useEffect(() => {
		if (
			enableNotifications &&
			'Notification' in window &&
			Notification.permission === 'default'
		) {
			Notification.requestPermission();
		}
	}, [enableNotifications]);

	/**
	 * * Fullscreen change effect
	 * ? Listens for fullscreen changes and updates state
	 */
	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFocusMode(!!document.fullscreenElement);
		};

		document.addEventListener('fullscreenchange', handleFullscreenChange);
		document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
		document.addEventListener('mozfullscreenchange', handleFullscreenChange);
		document.addEventListener('MSFullscreenChange', handleFullscreenChange);

		return () => {
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
			document.removeEventListener(
				'webkitfullscreenchange',
				handleFullscreenChange,
			);
			document.removeEventListener(
				'mozfullscreenchange',
				handleFullscreenChange,
			);
			document.removeEventListener(
				'MSFullscreenChange',
				handleFullscreenChange,
			);
		};
	}, []);

	/**
	 * * Keyboard shortcuts effect
	 * ? Sets up global keyboard event listeners
	 */
	useEffect(() => {
		document.addEventListener('keydown', handleKeyPress);
		return () => {
			document.removeEventListener('keydown', handleKeyPress);
		};
	}, [handleKeyPress]);

	// ! RENDER COMPONENT
	return (
		// * Outer container with dynamic classes for focus mode
		<div
			ref={focusContainerRef}
			className={cn(
				'w-full max-w-2xl mx-auto space-y-6 transition-all duration-500 ',
				className,
				isFocusMode &&
					`${currentModeConfig.fullscreenBg} w-screen h-screen max-w-none flex flex-col justify-center items-center p-0 space-y-0 relative overflow-hidden`,
			)}>
			{/* * Animated background particles for fullscreen mode */}
			{isFocusMode && (
				<div className='absolute inset-0 overflow-hidden pointer-events-none'>
					{Array.from({ length: 20 }).map((_, i) => (
						<div
							key={i}
							className={cn(
								'absolute w-1 h-1 bg-white/10 rounded-full animate-pulse',
								'animate-bounce',
							)}
							style={{
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
								animationDelay: `${Math.random() * 2}s`,
								animationDuration: `${3 + Math.random() * 2}s`,
							}}
						/>
					))}
				</div>
			)}

			{/* * Control buttons for fullscreen and keyboard help */}
			<div
				className={cn(
					'absolute top-4 right-4 z-50 flex gap-2',
					isFocusMode && 'top-8 right-8',
				)}>
				{!isFocusMode && (
					<Button
						onClick={() => setShowKeyboardHelp(!showKeyboardHelp)}
						variant='ghost'
						size='icon'
						className='hover:bg-muted-foreground/10'
						title='Keyboard shortcuts (?)'>
						<Keyboard className='w-5 h-5' />
					</Button>
				)}
				<Button
					onClick={toggleFullscreen}
					variant='ghost'
					size='icon'
					className={cn(
						'hover:bg-muted-foreground/10 transition-all duration-200',
						isFocusMode && 'bg-black/20 hover:bg-black/30 text-white',
					)}
					title={isFocusMode ? 'Exit fullscreen (F)' : 'Enter fullscreen (F)'}>
					{isFocusMode ? (
						<Minimize className='w-5 h-5' />
					) : (
						<Maximize className='w-5 h-5' />
					)}
				</Button>
			</div>

			{/* * Keyboard shortcuts help overlay */}
			{showKeyboardHelp && !isFocusMode && (
				<div className='absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40'>
					<div className='bg-background border rounded-lg p-6 max-w-md'>
						<h3 className='text-lg font-semibold mb-4'>Keyboard Shortcuts</h3>
						<div className='grid gap-2 text-sm'>
							<div className='flex justify-between'>
								<span>Play/Pause</span>
								<kbd className='px-2 py-1 bg-muted rounded text-xs'>Space</kbd>
							</div>
							<div className='flex justify-between'>
								<span>Reset</span>
								<kbd className='px-2 py-1 bg-muted rounded text-xs'>R</kbd>
							</div>
							<div className='flex justify-between'>
								<span>Settings</span>
								<kbd className='px-2 py-1 bg-muted rounded text-xs'>S</kbd>
							</div>
							<div className='flex justify-between'>
								<span>Fullscreen</span>
								<kbd className='px-2 py-1 bg-muted rounded text-xs'>F</kbd>
							</div>
							<div className='flex justify-between'>
								<span>Work Mode</span>
								<kbd className='px-2 py-1 bg-muted rounded text-xs'>1</kbd>
							</div>
							<div className='flex justify-between'>
								<span>Short Break</span>
								<kbd className='px-2 py-1 bg-muted rounded text-xs'>2</kbd>
							</div>
							<div className='flex justify-between'>
								<span>Long Break</span>
								<kbd className='px-2 py-1 bg-muted rounded text-xs'>3</kbd>
							</div>
						</div>
						<Button
							onClick={() => setShowKeyboardHelp(false)}
							className='w-full mt-4'
							variant='outline'>
							Close
						</Button>
					</div>
				</div>
			)}

			{/* ! HEADER SECTION */}
			{!isFocusMode && (
				<div className='text-center space-y-2'>
					<div className='flex items-center justify-center gap-2'>
						<div
							className={cn(
								'flex items-center justify-center w-8 h-8 rounded-lg',
								`bg-linear-to-br ${currentModeConfig.bgGradient}`,
							)}>
							<currentModeConfig.icon className='w-4 h-4 text-white' />
						</div>
						<h1 className='text-2xl font-bold text-foreground'>
							{currentModeConfig.label}
						</h1>
					</div>
					<p className='text-sm text-muted-foreground'>
						{currentModeConfig.description}
					</p>
					<div className='flex items-center justify-center gap-2'>
						<Badge variant='secondary' className='gap-1'>
							<Zap className='w-3 h-3' />
							{completedWorkSessions} sessions completed
						</Badge>
					</div>
				</div>
			)}

			{/* ! MAIN TIMER CARD */}
			<Card
				className={cn(
					'overflow-hidden border-0 shadow-2xl transition-all duration-500 ',
					isFocusMode &&
						'bg-transparent border-none shadow-none flex items-center justify-center w-full h-full flex-col',
				)}>
				<CardContent
					className={cn(
						'p-8',
						isFocusMode &&
							'p-0 flex items-center justify-center flex-col space-y-8',
					)}>
					{/* * Fullscreen mode header */}
					{isFocusMode && (
						<div className='text-center space-y-4 animate-fade-in'>
							<div className='flex items-center justify-center gap-3'>
								<div
									className={cn(
										'flex items-center justify-center w-12 h-12 rounded-xl',
										`bg-linear-to-br ${currentModeConfig.bgGradient}`,
										'shadow-lg',
										currentModeConfig.glowColor,
									)}>
									<currentModeConfig.icon className='w-6 h-6 text-white' />
								</div>
								<h1 className='text-4xl md:text-6xl font-bold text-white tracking-tight'>
									{currentModeConfig.label}
								</h1>
							</div>
							<p className='text-xl md:text-2xl text-white/80 font-light'>
								{currentModeConfig.description}
							</p>
							<Badge
								variant='secondary'
								className='gap-2 px-4 py-2 text-lg bg-black/20 text-white border-white/20'>
								<Zap className='w-4 h-4' />
								{completedWorkSessions} sessions completed
							</Badge>
						</div>
					)}

					{/* * Timer Display Circle */}
					<div
						className={cn(
							'relative flex items-center justify-center',
							!isFocusMode && 'mb-8',
						)}>
						{/* ? Background Circle */}
						<div
							className={cn(
								'relative flex items-center justify-center rounded-full',
								'transition-all duration-500 ease-in-out',
								timerSizeClasses,
								isFocusMode
									? [
											'bg-black/20 backdrop-blur-sm',
											'border-4 border-white/20',
											'shadow-2xl',
											currentModeConfig.glowColor,
											'animate-pulse-glow',
										]
									: [
											'bg-linear-to-br from-background to-muted',
											'border-8',
											currentModeConfig.borderColor,
										],
							)}>
							{/* * Progress Ring */}
							<svg className='absolute inset-0 w-full h-full -rotate-90'>
								<circle
									cx='50%'
									cy='50%'
									r='45%'
									fill='none'
									stroke='currentColor'
									strokeWidth={isFocusMode ? '6' : '8'}
									className={cn(
										isFocusMode ? 'text-white/20' : 'text-muted opacity-20',
									)}
								/>
								<circle
									cx='50%'
									cy='50%'
									r='45%'
									fill='none'
									stroke='currentColor'
									strokeWidth={isFocusMode ? '6' : '8'}
									strokeLinecap='round'
									strokeDasharray={`${2 * Math.PI * 0.45 * 100}`}
									strokeDashoffset={`${
										2 *
										Math.PI *
										0.45 *
										100 *
										(1 - timerProgressPercentage / 100)
									}`}
									className={cn(
										'transition-all duration-300',
										isFocusMode
											? 'text-white drop-shadow-glow'
											: currentModeConfig.textColor,
									)}
									style={{
										filter: isFocusMode
											? 'drop-shadow(0 0 20px currentColor)'
											: undefined,
									}}
								/>
							</svg>

							{/* * Time Display */}
							<div className='text-center z-10'>
								<div
									className={cn(
										'font-mono font-bold transition-all duration-300',
										isFocusMode
											? ['text-white drop-shadow-xl', 'animate-pulse-text']
											: [
													'bg-linear-to-br bg-clip-text text-transparent',
													currentModeConfig.bgGradient,
												],
									)}
									style={{
										filter: isFocusMode
											? 'drop-shadow(0 0 30px rgba(255,255,255,0.5))'
											: undefined,
									}}>
									{String(timeRemaining.minutes).padStart(2, '0')}:
									{String(timeRemaining.seconds).padStart(2, '0')}
								</div>
								{!isFocusMode && (
									<div className='text-xs text-muted-foreground mt-2'>
										{Math.round(timerProgressPercentage)}% Complete
									</div>
								)}
							</div>
						</div>
					</div>

					{/* * Fullscreen control buttons */}
					{isFocusMode && (
						<div className='flex justify-center gap-6 animate-fade-in-up'>
							<Button
								onClick={toggleTimerState}
								size='lg'
								className={cn(
									'gap-3 px-8 py-4 text-xl font-semibold rounded-xl',
									'bg-white/10 hover:bg-white/20 text-white border border-white/20',
									'backdrop-blur-sm transition-all duration-300 hover:scale-105',
									'shadow-lg hover:shadow-xl',
									isTimerActive && 'animate-pulse',
								)}>
								{isTimerActive ? (
									<>
										<Pause className='w-6 h-6' />
										Pause
									</>
								) : (
									<>
										<Play className='w-6 h-6' />
										Start
									</>
								)}
							</Button>

							<Button
								onClick={() => resetTimerToMode()}
								size='lg'
								className={cn(
									'gap-3 px-8 py-4 text-xl font-semibold rounded-xl',
									'bg-white/10 hover:bg-white/20 text-white border border-white/20',
									'backdrop-blur-sm transition-all duration-300 hover:scale-105',
									'shadow-lg hover:shadow-xl',
								)}>
								<RotateCcw className='w-5 h-5' />
								Reset
							</Button>

							<Button
								onClick={() => setAreSettingsVisible(!areSettingsVisible)}
								size='lg'
								className={cn(
									'gap-3 px-8 py-4 text-xl font-semibold rounded-xl',
									'bg-white/10 hover:bg-white/20 text-white border border-white/20',
									'backdrop-blur-sm transition-all duration-300 hover:scale-105',
									'shadow-lg hover:shadow-xl',
								)}>
								<Settings className='w-5 h-5' />
								Settings
							</Button>
						</div>
					)}

					{/* * Progress Bar */}
					{!isFocusMode && (
						<div className='mb-6'>
							<Progress value={timerProgressPercentage} className='h-2' />
						</div>
					)}

					{/* * Mode Selection Buttons */}
					{!isFocusMode && (
						<div className='grid grid-cols-3 gap-2 mb-6'>
							{Object.entries(MODE_CONFIGURATION).map(([mode, config]) => {
								const Icon = config.icon;
								const isActive = currentTimerMode === mode;

								return (
									<Button
										key={mode}
										onClick={() => setCurrentTimerMode(mode as TimerMode)}
										variant={isActive ? 'default' : 'outline'}
										className={cn(
											'gap-2 transition-all duration-200',
											isActive &&
												`bg-linear-to-r ${config.bgGradient} hover:opacity-90`,
										)}>
										<Icon className='w-4 h-4' />
										<span className='hidden sm:inline'>{config.label}</span>
									</Button>
								);
							})}
						</div>
					)}

					{/* * Control Buttons */}
					{!isFocusMode && (
						<div className='flex justify-center gap-4 mb-6'>
							<Button
								onClick={toggleTimerState}
								size='lg'
								className={cn(
									'gap-2 px-8 py-3 text-lg font-semibold',
									'bg-linear-to-r transition-all duration-200 hover:scale-105',
									isTimerActive
										? 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
										: `${currentModeConfig.bgGradient} hover:opacity-90`,
								)}>
								{isTimerActive ? (
									<>
										<Pause className='w-5 h-5' />
										Pause
									</>
								) : (
									<>
										<Play className='w-5 h-5' />
										Start
									</>
								)}
							</Button>

							<Button
								onClick={() => resetTimerToMode()}
								variant='outline'
								size='lg'
								className='gap-2 px-6'>
								<RotateCcw className='w-4 h-4' />
								Reset
							</Button>

							<Button
								onClick={() => setAreSettingsVisible(!areSettingsVisible)}
								variant='outline'
								size='lg'
								className='gap-2 px-6'>
								<Settings className='w-4 h-4' />
								Settings
							</Button>
						</div>
					)}

					{/* ! SETTINGS SECTION */}
					{areSettingsVisible && (
						<div
							className={cn(
								'border-t pt-6 space-y-4',
								isFocusMode && [
									'bg-black/20 backdrop-blur-sm rounded-xl p-6 border border-white/20',
									'shadow-lg max-w-2xl w-full',
								],
							)}>
							<h3
								className={cn(
									'text-lg font-semibold text-center',
									isFocusMode && 'text-white text-2xl',
								)}>
								Timer Settings
							</h3>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								{Object.entries(timerConfiguration).map(([mode, duration]) => {
									const config = MODE_CONFIGURATION[mode as TimerMode];
									const Icon = config.icon;

									return (
										<div key={mode} className='space-y-2'>
											<label
												className={cn(
													'flex items-center gap-2 text-sm font-medium',
													isFocusMode && 'text-white',
												)}>
												<Icon className='w-4 h-4' />
												{config.label} (minutes)
											</label>
											<Input
												type='number'
												min='1'
												max='180'
												value={duration}
												onChange={(e) =>
													updateTimerDuration(
														mode as TimerMode,
														parseInt(e.target.value) || 1,
													)
												}
												className={cn(
													'text-center',
													isFocusMode &&
														'bg-white/10 border-white/20 text-white placeholder:text-white/50',
												)}
											/>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* * Floating progress indicator for fullscreen mode */}
			{isFocusMode && (
				<div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-fade-in-up'>
					<div className='flex items-center gap-4 bg-black/20 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20'>
						<div className='text-white font-medium'>
							{Math.round(timerProgressPercentage)}% Complete
						</div>
						<div className='w-32 h-2 bg-white/20 rounded-full overflow-hidden'>
							<div
								className='h-full bg-white rounded-full transition-all duration-300 shadow-glow'
								style={{
									width: `${timerProgressPercentage}%`,
									boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
								}}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

// ! EXPORT
export default PomodoroTimer;

// ! CUSTOM CSS ANIMATIONS (Add to your global CSS)
/*
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px currentColor; }
  50% { box-shadow: 0 0 40px currentColor, 0 0 60px currentColor; }
}

@keyframes pulse-text {
  0%, 100% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.5); }
  50% { text-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.6); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.animate-pulse-text {
  animation: pulse-text 2s ease-in-out infinite;
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out;
}

.animate-fade-in-up {
  animation: fade-in-up 1s ease-out;
}

.drop-shadow-glow {
  filter: drop-shadow(0 0 20px currentColor);
}

.shadow-glow {
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}
*/

// ! PERFORMANCE OPTIMIZATIONS IMPLEMENTED:
// * 1. Memoized calculations for progress and mode configuration
// * 2. Callback functions to prevent unnecessary re-renders
// * 3. Proper cleanup of intervals to prevent memory leaks
// * 4. Optimized state updates with functional updates
// * 5. Strategic use of useRef for values that don't need re-renders
// * 6. Efficient keyboard event handling with single listener

// ! UI/UX IMPROVEMENTS IMPLEMENTED:
// * 1. Modern gradient design with smooth animations
// * 2. Circular progress visualization with SVG rings
// * 3. Comprehensive mode system with icons and descriptions
// * 4. Session tracking and progress indicators
// * 5. Collapsible settings panel for customization
// * 6. Responsive design with multiple size options
// * 7. Visual feedback for all user interactions
// * 8. Professional color scheme and typography
// * 9. Notification system for timer completions
// * 10. Auto-progression between timer modes
// * 11. Enhanced fullscreen focus mode with dramatic UI
// * 12. Keyboard shortcuts for all major functions
// * 13. Animated background particles in fullscreen
// * 14. Glowing effects and enhanced visual feedback
// * 15. Floating progress indicator in fullscreen
// * 16. Keyboard shortcuts help overlay

// ! NEW FEATURES ADDED:
// * 1. Play/Pause buttons in fullscreen mode
// * 2. Keyboard shortcuts (Space, R, S, F, 1-3, ?)
// * 3. Dramatic fullscreen UI with animated backgrounds
// * 4. Enhanced visual effects with glows and shadows
// * 5. Floating progress indicator in fullscreen
// * 6. Keyboard shortcuts help overlay
// * 7. Improved animations and transitions
// * 8. Better visual hierarchy in fullscreen mode

// ! KEYBOARD SHORTCUTS:
// * Space - Toggle Play/Pause
// * R - Reset timer
// * S - Toggle settings
// * F - Toggle fullscreen
// * 1 - Work mode
// * 2 - Short break mode
// * 3 - Long break mode
// * ? - Show keyboard shortcuts help

// ! FUTURE IMPROVEMENTS:
// TODO: Add sound effects for timer events
// TODO: Implement local storage for settings persistence
// TODO: Add statistics and analytics dashboard
// TODO: Implement custom notification sounds
// TODO: Add timer presets for different activities
// TODO: Add integration with task management systems
// TODO: Implement team collaboration features
// TODO: Add ambient background sounds for focus mode
// TODO: Implement breathing exercises during breaks

export interface todaysTasksList {
	_id: string;
	category: string;
	todo: string;
	worthPoints: number;
	perceivedDifficulty: number;
	done: boolean;
	activeSessionStartedAt?: Date;
	todoDate: Date;
	workingSessions: { start: Date; end: Date; totalTime: number }[];
}

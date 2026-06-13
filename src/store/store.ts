import studySessionReducers from '@/reducers/streak.slice';
import { configureStore } from '@reduxjs/toolkit';
// import dataReducers from '@/reducers/data.slice';

export const store = configureStore({
	// reducer: { data: dataReducers },
	reducer: {
		studySession: studySessionReducers
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

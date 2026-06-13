import { createSlice } from "@reduxjs/toolkit";

interface initialState {
    isStudySessionActive: boolean;
    subjectDetails: {
        _id: string | "",
        subjectName: string | "No Study Session"
    }
    sessionStartTime: number | 0;
}

const initialState: initialState = {
    isStudySessionActive: false,
    subjectDetails: {
        _id: "",
        subjectName: "No Study Session"
    },
    sessionStartTime: 0
}



export const studySessionSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        startStudySession: (state, actions) => {
            const data = actions.payload;
            state.isStudySessionActive = true;
            state.sessionStartTime = data.sessionStartTime;
            state.subjectDetails = data.subjectDetails;
        },
        endStudySession: (state, actions) => {
            const data = actions.payload;
            state.isStudySessionActive = false;
            state.sessionStartTime = 0;
            state.subjectDetails = data.subjectDetails;
        },
    }
})

export const { startStudySession, endStudySession } = studySessionSlice.actions;
export default studySessionSlice.reducer;
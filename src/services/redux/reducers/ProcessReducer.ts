import { createSlice } from "@reduxjs/toolkit";
import type { Process } from "../../../types/Process";

const initialState = {
    processes: [] as Process[],
};

const ProcessSlice = createSlice({
    name: "process",
    initialState,
    reducers: {
        setProcess(state, { payload }: { payload: Process }) {
            if (!state.processes.find((p) => p.id == payload.id))
                state.processes.push(payload);
            else
                state.processes = state.processes.map((p) =>
                    p.id == payload.id ? payload : p
                );
        },
    },
});

export const { setProcess } = ProcessSlice.actions;

export default ProcessSlice.reducer;

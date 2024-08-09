import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "config",
  initialState: { postId: null },
  reducers: {
    startEditingPost(state, actions) {
      state.postId = actions.payload;
    },
    endEditingPost(state) {
      state.postId = null;
    },
  },
});

export const configActions = authSlice.actions;
export const configReducer = authSlice.reducer;

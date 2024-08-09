import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { status: "check", user: null },
  reducers: {
    login(state, actions) {
      // authFn.login(actions.payload.email, actions.payload.password);
      state.status = true;
      state.user = actions.payload;
    },
    logout(state) {
      state.status = false;
      state.user = null;
    },
  },
});

export const authActions = authSlice.actions;
export const authReducer = authSlice.reducer;

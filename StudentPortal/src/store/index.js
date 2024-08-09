import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./authStore";
import { configReducer } from "./configStore";
const store = configureStore({
  reducer: { auth: authReducer, config: configReducer },
});
export default store;

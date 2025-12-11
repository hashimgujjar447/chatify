"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { SocketInitializer } from "./SocketProvider";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

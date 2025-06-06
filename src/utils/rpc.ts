import type { ApiType } from "@/server/api";
import { hc } from "hono/client";

export const rpc = hc<ApiType>("/api");

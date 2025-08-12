import { hc } from "hono/client";
import type { ApiType } from "@/server/routes/api";

export const rpc = hc<ApiType>("/api");

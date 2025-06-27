import type { ApiType } from "@/server/routes/api";
import { hc } from "hono/client";

export const rpc = hc<ApiType>("/api");

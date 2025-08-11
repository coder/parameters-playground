import type { Handler } from "hono";
import { ArrowRightIcon } from "lucide-react";
import type { FC } from "react";
import { renderToString } from "react-dom/server";
import { BaseHeader } from "../utils";

export const notFound: Handler = (c) => {
	return c.html(
		["<!doctype html>", renderToString(<NotFound />)].join("\n"),
		404,
	);
};

const NotFound: FC = () => {
	return (
		<html lang="en">
			<head>
				<title>Not Found</title>
				<BaseHeader />
			</head>
			<body>
				<main className="flex h-dvh w-screen items-center justify-center">
					<div className="flex flex-col items-center gap-2 md:gap-4">
						<div className="flex flex-col items-center gap-1 md:gap-2">
							<p className="font-mono text-sky-700">404</p>
							<h1 className="text-center font-semibold text-3xl text-content-primary md:text-6xl">
								Page not found
							</h1>
						</div>
						<p className="text text-center text-content-secondary md:text-lg">
							Sorry, we couldn't find this page
						</p>
						<a
							href="/parameters"
							className="group flex gap-1 text-center text-blue-700 underline transition-colors hover:text-blue-700 hover:underline md:text-content-primary md:no-underline"
						>
							Return home{" "}
							<ArrowRightIcon
								className="transform transition-transform group-hover:translate-x-1"
								width={16}
							/>
						</a>
					</div>
				</main>
			</body>
		</html>
	);
};

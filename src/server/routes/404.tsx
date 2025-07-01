import type { Handler } from "hono";
import { BaseHeader } from "../utils";
import { renderToString } from "react-dom/server";
import type { FC } from "react";
import { ArrowRightIcon } from "lucide-react";

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
				<main className="flex items-center justify-center w-screen h-dvh">
					<div className="flex flex-col gap-2 md:gap-4 items-center">
						<div className="flex flex-col items-center gap-1 md:gap-2">
							<p className="font-mono text-sky-700">404</p>
							<h1 className="text-3xl md:text-6xl font-semibold text-content-primary text-center">
								Page not found
							</h1>
						</div>
						<p className="text text-content-secondary md:text-lg text-center">
							Sorry, we couldn't find this page
						</p>
						<a
							href="/parameters"
							className="flex text-center hover:underline gap-1 text-blue-700 md:text-content-primary hover:text-blue-700 transition-colors group underline md:no-underline"
						>
							Return home{" "}
							<ArrowRightIcon
								className="group-hover:translate-x-1 transform transition-transform"
								width={16}
							/>
						</a>
					</div>
				</main>
			</body>
		</html>
	);
};

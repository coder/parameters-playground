import path from "node:path";
import type { FC } from "react";

export const getAssetPath = (assetPath: string): string => {
	if (import.meta.env.PROD) {
		const pathParts = assetPath.split(path.sep);
		return pathParts[pathParts.length - 1];
	} else {
		return assetPath;
	}
};

// Along with the vite React plugin this enables HMR within react while
// running the dev server.
export const HmrScript: FC<{ url: URL }> = ({ url }) => {
	if (import.meta.env.PROD) {
		return null;
	}

	const injectClientScript = `
    import RefreshRuntime from "${url.origin}/@react-refresh";
    RefreshRuntime.injectIntoGlobalHook(window);
    window.$RefreshReg$ = () => {};
    window.$RefreshSig$ = () => (type) => type;
    window.__vite_plugin_react_preamble_installed__ = true;
    `;

	return <script type="module">{injectClientScript}</script>;
};

export const BaseHeader = () => {
	return (
		<>
			<meta charSet="UTF-8" />
			<link rel="icon" type="image/svg+xml" href={getAssetPath("/logo.svg")} />
			<link rel="stylesheet" href={getAssetPath("/src/client/index.css")} />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		</>
	);
};

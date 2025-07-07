export const downloadData = (data: unknown, fileName: string) => {
	const blob = new Blob([JSON.stringify(data, null, 2)], {
		type: "application/json",
	});

	const url = URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.href = url;
	link.download = fileName.endsWith(".json") ? fileName : `${fileName}.json`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	// Give the click event enough time to fire and then revoke the URL.
	// This method of doing it doesn't seem great but I'm not sure if there is a
	// better way.
	setTimeout(() => {
		URL.revokeObjectURL(url);
	}, 100);
};

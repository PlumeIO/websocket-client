export enum RequestMethod {
	GET = "GET",
	POST = "POST",
	PUT = "PUT",
	PATCH = "PATCH",
	DELETE = "DELETE",
}

export default async function makeRequest(
	url: string,
	method: RequestMethod,
	body: object | undefined = undefined
) {
	const response = await fetch(url, {
		headers: {
			"Content-type": "application/json",
		},
		method,
		body: JSON.stringify(body),
	});
	const data = await response.json();
	return data;
}

import makeRequest, { RequestMethod } from "./makeRequest";

export type FailCase = [boolean, string];

export default async function handleRequest(
	url: string,
	method: RequestMethod,
	body: any,
	failCases: FailCase[],
	onSuccess: (response: any) => void,
	onFail: ((response: any) => void) | undefined = undefined
) {
	return new Promise(async (resolve, reject) => {
		failCases.forEach((failCase) => {
			if (failCase[0]) {
				return reject(failCase[1]);
			}
		});
		const response = await makeRequest(url, method, body);
		if (response.success) {
			onSuccess(response);
			resolve(response.data);
		} else {
			if (onFail) onFail(response);
			reject(response.message);
		}
	});
}

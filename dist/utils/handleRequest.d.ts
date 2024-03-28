import { RequestMethod } from "./makeRequest";
export type FailCase = [boolean, string];
export default function handleRequest(url: string, method: RequestMethod, body: any, failCases: FailCase[], onSuccess: (response: any) => void, onFail?: ((response: any) => void) | undefined): Promise<unknown>;

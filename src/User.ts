export type UserJson = {
	id: string;
	name: string;
};

export class User {
	id: string | undefined;
	name: string;

	constructor(name: string, id: string | undefined = undefined) {
		this.name = name;
		this.id = id;
	}

	static findBy(key: string, value: string, list: User[]) {
		// @ts-ignore
		return list.find((user) => user[key] === value);
	}
}

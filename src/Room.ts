import { SocketClient, User, UserJson } from ".";

export enum RoomState {
	OPEN = "OPEN",
	CLOSE = "CLOSE",
}

export type RoomConfig = {
	id: string;
	name: string;
	clientName: string;
	users: UserJson[];
	admin: UserJson;
	state: RoomState;
	data: any;
};

export type DataMiddleware<T> = (data: any) => T;
export type Resolver<T> = (value: T) => void;

export type PromiseResolvers<T> = {
	users: Resolver<User[]> | undefined;
	admin: Resolver<User> | undefined;
	state: Resolver<RoomState> | undefined;
	data: Resolver<T> | undefined;
	custom: Resolver<any> | undefined;
};

export class Room<DataType> {
	#client: SocketClient<DataType>;

	#id: string;
	#name: string;
	#users: User[];
	#admin: User;
	#state: RoomState;
	#dataMiddleware: DataMiddleware<DataType> | undefined;
	#data: DataType;

	#promiseResolvers: PromiseResolvers<DataType> = {
		users: undefined,
		admin: undefined,
		state: undefined,
		data: undefined,
		custom: undefined,
	};

	constructor(
		client: SocketClient<DataType>,
		config: RoomConfig,
		dataMiddleware: DataMiddleware<DataType> | undefined = undefined
	) {
		this.#client = client;
		this.#id = config.id;
		this.#name = config.name;

		this.#users = this.collectUsersFrom(config.users);

		this.#admin = this.#users.find((user) => user.id === config.admin.id)!;
		this.#state = config.state;
		this.#dataMiddleware = dataMiddleware;

		const data =
			config.data === undefined ? this.client.initialData : config.data;
		if (dataMiddleware) this.#data = dataMiddleware(data);
		else this.#data = data;
	}

	open = () => {
		console.log("room opens", this.#id);
		this.#client.socket.on(`${this.#id}/data-update`, this.#onDataUpdate);
		this.#client.socket.on(`${this.#id}/state-update`, this.#onStateUpdate);
		this.#client.socket.on(`${this.#id}/admin-update`, this.#onAdminUpdate);
		this.#client.socket.on(`${this.#id}/users-update`, this.#onUsersUpdate);
		this.#client.socket.on(`${this.#id}/custom`, this.#onCustom);
	};

	close = () => {
		console.log("room closes");
		this.#client.socket.off(`${this.#id}/data-update`, this.#onDataUpdate);
		this.#client.socket.off(
			`${this.#id}/state-update`,
			this.#onStateUpdate
		);
		this.#client.socket.off(
			`${this.#id}/admin-update`,
			this.#onAdminUpdate
		);
		this.#client.socket.off(
			`${this.#id}/users-update`,
			this.#onUsersUpdate
		);
		this.#client.socket.off(`${this.#id}/custom`, this.#onCustom);
	};

	#resolve = (key: "data" | "users" | "admin" | "state" | "custom") => {
		const resolver = this.#promiseResolvers[key];
		// @ts-ignore
		if (resolver) resolver(this[key]);
		this.#promiseResolvers[key] = undefined;
	};

	#handleSync = async <T>(
		key: "data" | "users" | "admin" | "state" | "custom",
		value: T,
		method: (value: T) => void
	) => {
		return new Promise((resolve, reject) => {
			if (this.#promiseResolvers[key] === undefined) {
				this.#promiseResolvers[key] = resolve;
				method(value);
			} else reject(`An unresolved ${key} promise exists`);
		});
	};

	collectUsersFrom(usersJson: UserJson[]) {
		let users: User[] = [];
		usersJson.forEach((userJson) => {
			if (userJson.id === this.#client.user?.id)
				users.push(this.#client.user);
			else users.push(new User(userJson.name, userJson.id));
		});
		return users;
	}

	#onDataUpdate = (data: DataType) => {
		this.#resolve("data");

		if (this.#dataMiddleware) this.#data = this.#dataMiddleware(data);
		else this.#data = data;
		this.onDataUpdate(data);
	};

	#onStateUpdate = (state: RoomState) => {
		this.#resolve("state");

		this.#state = state;
		this.onStateUpdate(state);
	};

	#onAdminUpdate = (admin: UserJson) => {
		this.#resolve("admin");

		this.#admin = User.findBy("id", admin.id, this.#users)!;
		this.onAdminUpdate(admin);
	};

	#onUsersUpdate = (users: UserJson[]) => {
		this.#resolve("users");

		this.#users = this.collectUsersFrom(users);
		console.log("users-update", users);
		this.onUsersUpdate(users);

		if (this.client.user && this.#users.indexOf(this.client.user) === -1) {
			this.client.exitRoomClient();
			this.onKick();
		}
	};

	#onCustom = (req: any) => {
		this.#resolve("custom");
		this.onRequest(req);
		if (this.admin === this.client.user) this.handleRequestAsAdmin(req);
	};

	onDataUpdate = (_data: DataType) => {};
	onStateUpdate = (_state: RoomState) => {};
	onAdminUpdate = (_admin: User) => {};
	onUsersUpdate = (_users: User[]) => {};
	onKick = () => {};
	onRequest = (_req: any) => {};
	handleRequestAsAdmin = (_req: any) => {};

	removeUser = (user: User) => {
		this.#client.socket.emit("remove-user", user.id);
	};
	removeUserSync = async (user: User) => {
		const response = await this.#handleSync("users", user, this.removeUser);
		return response;
	};

	updateData = (data: DataType) => {
		this.#client.socket.emit("data-update", data);
	};
	updateDataSync = async (data: DataType) => {
		const response = await this.#handleSync("data", data, this.updateData);
		return response;
	};

	updateState = (state: RoomState) => {
		this.#client.socket.emit("state-update", state);
	};
	updateStateSync = async (state: RoomState) => {
		const response = await this.#handleSync(
			"state",
			state,
			this.updateState
		);
		return response;
	};

	updateAdmin = (admin: User) => {
		this.#client.socket.emit("admin-update", admin.id);
	};
	updateAdminSync = async (admin: User) => {
		const response = await this.#handleSync(
			"admin",
			admin,
			this.updateAdmin
		);
		return response;
	};

	updateDataCustom = () => {
		this.#client.socket.emit("custom-data-update", this.data);
	};
	sendRequest = (req: any) => {
		this.#client.socket.emit("custom", req);
	};
	sendRequestSync = async (req: any) => {
		const response = await this.#handleSync(
			"custom",
			req,
			this.sendRequest
		);
		return response;
	};

	get client() {
		return this.#client;
	}
	get id() {
		return this.#id;
	}
	get name() {
		return this.#name;
	}
	get users() {
		return this.#users;
	}
	get admin() {
		return this.#admin;
	}
	get state() {
		return this.#state;
	}
	get data() {
		return this.#data;
	}
}

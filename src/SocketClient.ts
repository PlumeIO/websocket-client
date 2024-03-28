import { Socket, io } from "socket.io-client";
import { User, Room, DataMiddleware, RoomConfig } from ".";
import makeRequest, { RequestMethod } from "./utils/makeRequest";
import handleRequest from "./utils/handleRequest";

export enum ClientState {
	DISCONNECTED = "DISCONNECTED",
	CONNECTING = "CONNECTING",
	CONNECTED = "CONNECTED",
	DISCONNECTING = "DISCONNECTING",
}

export class SocketClient<DataType> {
	host: string = "plume-websocket.onrender.com";
	// host: string = "192.168.129.64:3000";
	secure = true;
	name: string;
	readonly socket: Socket;
	#state: ClientState = ClientState.DISCONNECTED;
	user: User | undefined;
	initialData: DataType | undefined;
	#room: Room<DataType> | undefined;
	#promiseResolve: ((value: unknown) => void) | undefined = undefined;

	constructor(name: string) {
		this.name = name;
		this.socket = io(this.wsURI, {
			autoConnect: false,
			transports: ["websocket"],
		});

		this.socket.on("connect", this.#onConnect);
		this.socket.on("disconnect", this.#onDisconnect);
		this.socket.on("connect_error", this.#onError);
	}

	connect = async () => {
		return new Promise((resolve, reject) => {
			if (!this.user)
				reject("Unable to connect. Client needs a user first");
			else if (this.#state === ClientState.DISCONNECTED) {
				this.#state = ClientState.CONNECTING;
				this.#promiseResolve = resolve;

				this.socket.io.opts.query = { name: this.user.name };
				this.socket.connect();
			} else
				reject(
					`Unable to connect. Client is in state of ${this.#state}`
				);
		});
	};

	#onConnect = () => {
		if (this.#promiseResolve) this.#promiseResolve(this.socket);

		this.#state = ClientState.CONNECTED;
		if (this.user) this.user.id = this.socket?.id;

		this.onConnect();
	};

	onConnect = () => {};

	disconnect = async () => {
		return new Promise((resolve, reject) => {
			if (this.#state === ClientState.CONNECTED) {
				this.#state = ClientState.DISCONNECTING;
				this.#promiseResolve = resolve;

				this.socket.disconnect();
			} else
				reject(
					`Unable to disconnect. Client is in state of ${this.state}`
				);
		});
	};

	#onDisconnect = () => {
		if (this.#promiseResolve) this.#promiseResolve(this.socket);

		this.#state = ClientState.DISCONNECTED;
		if (this.user) this.user.id = undefined;

		this.onDisconnect();
	};

	onDisconnect = () => {};

	#onError = (err: any) => {
		if (this.#promiseResolve) this.#promiseResolve(err);

		this.#state = ClientState.DISCONNECTED;

		this.onError(err);
	};
	onError = (_err: any) => {};

	getRooms = async (): Promise<RoomConfig[]> => {
		const response = await makeRequest(
			`${this.backendURL}/room`,
			RequestMethod.GET
		);
		return response.data;
	};

	#connectRoom = async (
		roomKey: string,
		connectMethod: "create" | "join",
		dataMiddleware: DataMiddleware<DataType> | undefined = undefined
	) => {
		const response = await handleRequest(
			`${this.backendURL}/room/${connectMethod}`,
			RequestMethod.POST,
			{
				roomName: connectMethod === "create" ? roomKey : undefined,
				roomId:
					connectMethod === "create"
						? `${this.name}-${roomKey}-${Date.now()}`
						: roomKey,
				clientName: connectMethod === "create" ? this.name : undefined,
				userId: this.user.id!,
			},
			[
				[
					this.user === undefined,
					`Unable to ${connectMethod} room. Client needs a user first`,
				],
				[
					this.initialData === undefined,
					`Unable to ${connectMethod} room. Client needs an initialData first`,
				],
			],
			async (response) => {
				if (this.#room) await this.exitRoom();
				this.#room = new Room<DataType>(
					this,
					response.data,
					dataMiddleware
				);
				this.#room.open();
			}
		);

		return response;
	};

	createRoom = async (
		roomName: string,
		dataMiddleware: DataMiddleware<DataType> | undefined = undefined
	) => {
		const response = await this.#connectRoom(
			roomName,
			"create",
			dataMiddleware
		);
		return response;
	};

	joinRoom = async (
		roomId: string,
		dataMiddleware: DataMiddleware<DataType> | undefined = undefined
	) => {
		const response = await this.#connectRoom(
			roomId,
			"join",
			dataMiddleware
		);
		return response;
	};

	exitRoom = async () => {
		const response = await handleRequest(
			`${this.backendURL}/room/exit`,
			RequestMethod.POST,
			{
				roomId: this.#room?.id,
				userId: this.user?.id,
			},
			[
				[
					this.user === undefined,
					"Unable to exit room. Client needs a user first",
				],
				[
					this.room === undefined,
					"Unable to exit room. User needs to be in a room first",
				],
			],
			this.exitRoomClient
		);
		return response;
	};

	exitRoomClient = () => {
		this.#room?.close();
		this.#room = undefined;
	};

	get room() {
		return this.#room;
	}
	get state() {
		return this.#state;
	}
	get backendURL() {
		if (this.secure) return `https://${this.host}`;
		else return `http://${this.host}`;
	}
	get wsURI() {
		if (this.secure) return `wss://${this.host}`;
		else return `ws://${this.host}`;
	}
}

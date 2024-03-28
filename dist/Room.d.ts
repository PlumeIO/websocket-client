import { SocketClient, User, UserJson } from ".";
export declare enum RoomState {
    OPEN = "OPEN",
    CLOSE = "CLOSE"
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
export declare class Room<DataType> {
    #private;
    constructor(client: SocketClient<DataType>, config: RoomConfig, dataMiddleware?: DataMiddleware<DataType> | undefined);
    open: () => void;
    close: () => void;
    collectUsersFrom(usersJson: UserJson[]): User[];
    onDataUpdate: (_data: DataType) => void;
    onStateUpdate: (_state: RoomState) => void;
    onAdminUpdate: (_admin: User) => void;
    onUsersUpdate: (_users: User[]) => void;
    onKick: () => void;
    onRequest: (_req: any) => void;
    handleRequestAsAdmin: (_req: any) => void;
    removeUser: (user: User) => void;
    removeUserSync: (user: User) => Promise<unknown>;
    updateData: (data: DataType) => void;
    updateDataSync: (data: DataType) => Promise<unknown>;
    updateState: (state: RoomState) => void;
    updateStateSync: (state: RoomState) => Promise<unknown>;
    updateAdmin: (admin: User) => void;
    updateAdminSync: (admin: User) => Promise<unknown>;
    updateDataCustom: () => void;
    sendRequest: (req: any) => void;
    sendRequestSync: (req: any) => Promise<unknown>;
    get client(): SocketClient<DataType>;
    get id(): string;
    get name(): string;
    get users(): User[];
    get admin(): User;
    get state(): RoomState;
    get data(): DataType;
}

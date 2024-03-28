import { Socket } from "socket.io-client";
import { User, Room, DataMiddleware, RoomConfig } from ".";
export declare enum ClientState {
    DISCONNECTED = "DISCONNECTED",
    CONNECTING = "CONNECTING",
    CONNECTED = "CONNECTED",
    DISCONNECTING = "DISCONNECTING"
}
export declare class SocketClient<DataType> {
    #private;
    host: string;
    secure: boolean;
    name: string;
    readonly socket: Socket;
    user: User | undefined;
    initialData: DataType | undefined;
    constructor(name: string);
    connect: () => Promise<unknown>;
    onConnect: () => void;
    disconnect: () => Promise<unknown>;
    onDisconnect: () => void;
    onError: (_err: any) => void;
    getRooms: () => Promise<RoomConfig[]>;
    createRoom: (roomName: string, dataMiddleware?: DataMiddleware<DataType> | undefined) => Promise<unknown>;
    joinRoom: (roomId: string, dataMiddleware?: DataMiddleware<DataType> | undefined) => Promise<unknown>;
    exitRoom: () => Promise<unknown>;
    exitRoomClient: () => void;
    get room(): Room<DataType>;
    get state(): ClientState;
    get backendURL(): string;
    get wsURI(): string;
}


export enum SocketMsgType {
    Ping,
    Pong,
    Register,
    FrameSync,
}

export interface SocketMsg<T> {
    type: SocketMsgType;
    data: T
}

export interface RegisterMsg {
    uid: string;
}

export interface LogicFrame {
    uid: string;
    color: cc.Color;
    renderFrames: Array<RenderFrame>;
}

export interface RenderFrame {
    t: number; // 时间戳
    d: cc.Vec2; // 方向
    p: cc.Vec2; // 位置
}
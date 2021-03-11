import { SocketMsgType, SocketMsg, RegisterMsg, LogicFrame } from "./FrameModels";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FrameSyncMgr {

    ws: WebSocket = null;
    pingTimer: number = null;

    handleFrameSyncMsg: Function = null; // handle frame sync message
    handleNetworkStatusMsg: Function = null; // handle network status message

    constructor(uid: string) {
        this.ws = new WebSocket("ws://192.168.31.89:8777");

        this.ws.onopen = (event) => {
            let msg: SocketMsg<RegisterMsg> = {
                type: SocketMsgType.Register,
                data: { uid: uid }
            };
            this.ws.send(JSON.stringify(msg));

            this.pingTimer = setInterval(() => {
                let pingMsg: SocketMsg<any> = {
                    type: SocketMsgType.Ping,
                    data: new Date().getTime()
                };
                this.ws.send(JSON.stringify(pingMsg));
            }, 2000);
        };

        this.ws.onmessage = (event) => {
            let msg: SocketMsg<any> = JSON.parse(event.data);
            switch (msg.type) {
                case SocketMsgType.Pong:
                    let delayTime: number = new Date().getTime() - msg.data;
                    this.handleNetworkStatusMsg(delayTime);
                    break;
                case SocketMsgType.FrameSync:
                    let logicFrames: Map<string, LogicFrame> = msg.data;
                    this.handleFrameSyncMsg(logicFrames);
                    break;
            }
        };

        this.ws.onerror = (event) => {
            clearInterval(this.pingTimer);
            this.handleNetworkStatusMsg(5001);
        };

        this.ws.onclose = (event) => {
            clearInterval(this.pingTimer);
            this.handleNetworkStatusMsg(5001);
        };
    }

    // update (dt) {}

    public sendMessage(data: string): void {
        if (this.ws.readyState == WebSocket.OPEN) {
            this.ws.send(data);
        }
    }

    private sendPingMsg(): void {
        if (this.ws != undefined && this.ws.readyState == WebSocket.OPEN) {
            let pingMsg: SocketMsg<any> = {
                type: SocketMsgType.Ping,
                data: new Date().getTime()
            };
            this.ws.send(JSON.stringify(pingMsg));
        }
    }
}

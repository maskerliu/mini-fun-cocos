const { ccclass, property } = cc._decorator;

import MapMgr from "./MapMgr";
import SnakeMgr from "./SnakeMgr"
import JoyStickMgr from "../common/JoyStickMgr"
import NetworkStatusMgr from "../common/NetworkStatusMgr"
import FrameSyncMgr from "../common/FrameSyncMgr"

import { LogicFrame, RenderFrame, SocketMsgType, SocketMsg } from "./FrameModels"
import { generateUid, randomColor } from "../common/Utils"

const LOGIC_FRAME_SIZE = 5;

@ccclass
export default class MainScene extends cc.Component {

    @property(cc.Prefab)
    snakePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    foodPrefab: cc.Prefab = null;

    @property(cc.Camera)
    mainCamera: cc.Camera = null;

    @property(cc.Node)
    map: cc.Node = null;

    @property(cc.Node)
    miniMap: cc.Node = null;

    @property(cc.Node)
    joyStick: cc.Node = null;

    @property(cc.Node)
    networkStatusPanel: cc.Node = null;

    snakes: Map<string, cc.Node> = null;
    joyStickMgr: JoyStickMgr = null;
    mapMgr: MapMgr = null;
    frameSyncMgr: FrameSyncMgr = null;
    networkStatusMgr: NetworkStatusMgr = null;

    uid: string = null;
    curFrame: number = 1; // 当前帧戳
    myLogicFrame: LogicFrame = null; // 本地用户逻辑帧
    logicFrames: Map<string, LogicFrame> = null;

    start() {
        cc.debug.setDisplayStats(false);

        // phyMgr.enabledAccumulator = true;
        // phyMgr.FIXED_TIME_STEP = 1 / 30;
        // phyMgr.VELOCITY_ITERATIONS = 8;
        // phyMgr.POSITION_ITERATIONS = 8;

        this.resetSize(this.node);
    }

    onLoad() {
        let phyMgr = cc.director.getPhysicsManager()
        phyMgr.enabled = true;
        // phyMgr.debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
        //     cc.PhysicsManager.DrawBits.e_jointBit |
        //     cc.PhysicsManager.DrawBits.e_shapeBit;
        phyMgr.gravity = cc.v2(0, 0);

        this.uid = generateUid();
        this.joyStickMgr = this.joyStick.getComponent("JoyStickMgr");
        this.networkStatusMgr = this.networkStatusPanel.getComponent("NetworkStatusMgr");
        this.mapMgr = this.map.getComponent("MapMgr");
        this.frameSyncMgr = new FrameSyncMgr(this.uid);

        this.snakes = new Map<string, cc.Node>();
        this.snakes[this.uid] = cc.instantiate(this.snakePrefab);
        this.snakes[this.uid].color = randomColor();
        this.snakes[this.uid].setPosition(this.randomPos());
        this.node.addChild(this.snakes[this.uid]);

        // this.mainCamera.getComponent("PlayerCameraMgr").target = this.snakes[this.uid];
        // this.mapMgr.setTarget(this.snakes[this.uid]);

        this.myLogicFrame = { uid: this.uid, color: this.snakes[this.uid].color, renderFrames: [] };
        this.logicFrames = new Map<string, LogicFrame>();

        this.frameSyncMgr.handleFrameSyncMsg = (data: Map<string, LogicFrame>) => {
            this.mergeLogicFrames(data);
        }

        this.frameSyncMgr.handleNetworkStatusMsg = (data: number) => {
            this.networkStatusMgr.updateNetworkStatus(data + 98);
        }
    }

    update(dt: number) {
        this.generateLogicFrame();
        this.consumeLogicFrame();

        this.snakes[this.uid].getComponent("SnakeMgr").direction = this.joyStickMgr.direction;
        this.miniMap.getChildByName("my_location").setPosition(this.mapToMiniMap(this.snakes[this.uid].getPosition()));
    }

    // 合成逻辑帧
    private generateLogicFrame() {
        if (this.curFrame == LOGIC_FRAME_SIZE) {
            let msg: SocketMsg<LogicFrame> = {
                type: SocketMsgType.FrameSync,
                data: this.myLogicFrame
            };
            this.frameSyncMgr.sendMessage(JSON.stringify(msg));
            this.myLogicFrame.renderFrames = [];
            this.curFrame = 1;
        } else { // merge render frame into logic frame
            let renderFrame: RenderFrame = {
                t: this.curFrame,
                d: this.joyStickMgr.direction,
                p: this.snakes[this.uid] == undefined ? null : this.snakes[this.uid].getPosition(),
            };
            this.myLogicFrame.renderFrames.push(renderFrame)
            this.curFrame += 1;
        }
    }

    // 消费逻辑帧
    private consumeLogicFrame() {
        for (let key in this.logicFrames) {
            if (this.uid == key) continue;
            // console.log(`snake:${key}, frames:${this.logicFrames[key].renderFrames.length}`);
            let renderFrame: RenderFrame = this.logicFrames[key].renderFrames.shift();
            if (renderFrame == undefined || renderFrame == null) continue;

            if (!this.snakes.hasOwnProperty(key)) {
                this.snakes[key] = cc.instantiate(this.snakePrefab);
                this.snakes[key].color = this.logicFrames[key].color;
                this.snakes[key].setPosition(cc.v2(renderFrame.p.x, renderFrame.p.y));
                this.node.addChild(this.snakes[key]);
            }

            let snakeMgr: SnakeMgr = this.snakes[key].getComponent("SnakeMgr");
            if (renderFrame.d != null) {
                snakeMgr.direction = cc.v2(renderFrame.d.x, renderFrame.d.y);
            } else {
                snakeMgr.direction = null;
            }

            if (renderFrame.p != null) { // 坐标信息用户校正用户位置，通过加速来获得位置补偿
                snakeMgr.destPosition = cc.v2(renderFrame.p.x, renderFrame.p.y);
            }

        }
    }

    private mergeLogicFrames(data: Map<string, LogicFrame>) {

        let invaildSnakes: Array<string> = [];
        for (let key in this.logicFrames) {
            if (!data.hasOwnProperty(key)) {
                invaildSnakes.push(key);
            }
        }

        for (let key of invaildSnakes) {
            console.log(`remove invalid snake: ${key}`);
            let snakeMgr: SnakeMgr = this.snakes[key].getComponent("SnakeMgr");
            snakeMgr.removeFromParent();
            delete this.snakes[key];
            delete this.logicFrames[key];
        }

        for (let key in data) {
            if (!this.logicFrames.hasOwnProperty(data[key])) {
                this.logicFrames[key] = data[key];
            } else {
                var renderFrames = this.logicFrames[key].renderFrames;
                if (!this.logicFrames[key].hasOwnProperty("renderFrames")) {
                    renderFrames = [];
                }
                this.logicFrames[key].renderFrames = Object.assign(renderFrames, data[key].renderFrames);
            }
        }
    }

    private mapToMiniMap(pos: cc.Vec2): cc.Vec2 {
        let x = pos.x / this.map.width * this.miniMap.width;
        let y = pos.y / this.map.height * this.miniMap.height;
        return cc.v2(x, y);
    }

    private randomPos(): cc.Vec2 {
        let width = this.node.width;
        let height = this.node.height;
        let x = Math.round(Math.random() * width) - width / 2;
        let y = Math.round(Math.random() * height) - height / 2;
        return cc.v2(x, y);
    }

    resetSize(cav: cc.Node) {
        let frameSize = cc.view.getFrameSize();
        let destSize = cc.view.getDesignResolutionSize();

        if (frameSize.width / frameSize.height > destSize.width / destSize.height) {
            cav.width = destSize.height * frameSize.width / frameSize.height;
            cav.height = destSize.height;
            cav.getComponent(cc.Canvas).designResolution = cc.size(cav.width, cav.height);
        } else {
            cav.width = destSize.width;
            cav.height = destSize.width * frameSize.height / frameSize.width;
            cav.getComponent(cc.Canvas).designResolution = cc.size(cav.width, cav.height);
        }
        // this.fitScreen(cav, destSize);
    }

    /**
     * 背景适配
     * @param node 
     * @param destSize 
     */
    fitScreen(node: cc.Node, destSize: cc.Size) {
        let scaleW = node.width / destSize.width;
        let scaleH = node.height / destSize.height;

        let bgScale = node.height / this.map.height;
        this.map.width *= bgScale;
        this.map.height *= bgScale;
        if (scaleW > scaleH) {
            bgScale = node.width / this.map.width;
            this.map.width *= bgScale;
            this.map.height *= bgScale;
        }
    }


}

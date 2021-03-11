const { ccclass, property } = cc._decorator;

import JoyStickMgr from "../common/JoyStickMgr"
import BulletMgr from "./BulletMgr";
import TankMgr from "./TankMgr";
import { TankBodyColor, TankLevel, TankType } from "./TankModels";

@ccclass
export default class TankDownMainSenceMgr extends cc.Component {

    @property(cc.Node)
    joyStick: cc.Node = null;

    @property(cc.Node)
    fireBtn: cc.Node = null;

    @property(cc.AudioClip)
    fireSound: cc.AudioClip = null;

    @property(cc.Prefab)
    tankNoramlPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    tankLargePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    tankHugePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    bulletPrefab: cc.Prefab = null;

    joyStickMgr: JoyStickMgr = null;

    tanks: Array<cc.Node> = [];

    bulletPool: Array<cc.Node> = [];

    offset: cc.Vec2 = cc.v2(0, 0);

    onLoad() {
        cc.director.getCollisionManager().enabled = true;
        let phyMgr = cc.director.getPhysicsManager();
        phyMgr.enabled = true;
        // phyMgr.debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
        //     cc.PhysicsManager.DrawBits.e_jointBit |
        //     cc.PhysicsManager.DrawBits.e_shapeBit;
        phyMgr.gravity = cc.v2(0, 0);

        this.joyStickMgr = this.joyStick.getComponent("JoyStickMgr");

        // this.generateTanks();
        this.generateBulltePool();
        this.resetSize(this.node);
    }

    start() {
        
    }

    generateTanks() {
        this.tanks[0] = cc.instantiate(this.tankNoramlPrefab);
        this.tanks[0].setPosition(this.randomPos());
        var tankMgr: TankMgr = this.tanks[0].getComponent("TankMgr");
        tankMgr.init(TankType.Normal, TankBodyColor.Green, TankLevel.Level_4);
        this.node.addChild(this.tanks[0]);

        // this.tanks[1] = cc.instantiate(this.tankNoramlPrefab);
        // this.tanks[1].setPosition(this.randomPos());
        // var tankMgr: TankMgr = this.tanks[1].getComponent("TankMgr");
        // tankMgr.init(TankType.Normal, TankBodyColor.Blue, TankLevel.Level_4);
        // tankMgr.direction = tankMgr.lstDirection = cc.v2(0, 0);
        // this.node.addChild(this.tanks[1]);

        this.tanks[2] = cc.instantiate(this.tankLargePrefab);
        this.tanks[2].setPosition(this.randomPos());
        var tankMgr: TankMgr = this.tanks[2].getComponent("TankMgr");
        tankMgr.init(TankType.Large, TankBodyColor.BigRed, TankLevel.Level_1);
        this.node.addChild(this.tanks[2]);

        this.tanks[3] = cc.instantiate(this.tankHugePrefab);
        this.tanks[3].setPosition(this.randomPos());
        var tankMgr: TankMgr = this.tanks[3].getComponent("TankMgr");
        tankMgr.init(TankType.Huge, TankBodyColor.Huge, TankLevel.Level_1);
        this.node.addChild(this.tanks[3]);
    }

    generateBulltePool() {
        for (var i = 0; i < 8; ++i) {
            let bulletNode = cc.instantiate(this.bulletPrefab);
            this.bulletPool.push(bulletNode);
            this.node.addChild(bulletNode);
        }
    }

    fire() {
        for (let tankNode of this.tanks) {

            if (tankNode == null) continue;

            var tankMgr: TankMgr = tankNode.getComponent("TankMgr");
            switch (tankMgr.type) {
                case TankType.Huge: {
                    let bulletNode = this.fetchBulletFromPool();
                    if (bulletNode) { // left
                        let dest = tankMgr.lstDirection.mul(tankNode.height / 2 + 35);
                        let dest1 = cc.v2(tankMgr.lstDirection.y, -tankMgr.lstDirection.x).mul(tankNode.width / 2 - 40);
                        let pos = tankNode.getPosition().add(dest).add(dest1);
                        bulletNode.setPosition(pos);
                        let bulletMgr: BulletMgr = bulletNode.getComponent("BulletMgr");
                        bulletMgr.init(tankMgr.color, tankMgr.level, tankMgr.lstDirection);
                    }

                    bulletNode = this.fetchBulletFromPool();
                    if (bulletNode) { // right
                        let dest = tankMgr.lstDirection.mul(tankNode.height / 2 + 35);
                        let dest1 = cc.v2(-tankMgr.lstDirection.y, tankMgr.lstDirection.x).mul(tankNode.width / 2 - 40);
                        let pos = tankNode.getPosition().add(dest).add(dest1);
                        bulletNode.setPosition(pos);
                        let bulletMgr: BulletMgr = bulletNode.getComponent("BulletMgr");
                        bulletMgr.init(tankMgr.color, tankMgr.level, tankMgr.lstDirection);
                    }
                    break;
                }
                case TankType.Large: {
                    let bulletNode = this.fetchBulletFromPool();
                    if (bulletNode) { // left
                        let dest = tankMgr.lstDirection.mul(tankNode.height / 2 + 35);
                        let dest1 = cc.v2(tankMgr.lstDirection.y, -tankMgr.lstDirection.x).mul(tankNode.width / 2 - 30);
                        let pos = tankNode.getPosition().add(dest).add(dest1);
                        bulletNode.setPosition(pos);
                        let bulletMgr: BulletMgr = bulletNode.getComponent("BulletMgr");
                        bulletMgr.init(tankMgr.color, tankMgr.level, tankMgr.lstDirection);
                    }

                    bulletNode = this.fetchBulletFromPool();
                    if (bulletNode) { // right
                        let dest = tankMgr.lstDirection.mul(tankNode.height / 2 + 35);
                        let dest1 = cc.v2(-tankMgr.lstDirection.y, tankMgr.lstDirection.x).mul(tankNode.width / 2 - 30);
                        let pos = tankNode.getPosition().add(dest).add(dest1);
                        bulletNode.setPosition(pos);
                        let bulletMgr: BulletMgr = bulletNode.getComponent("BulletMgr");
                        bulletMgr.init(tankMgr.color, tankMgr.level, tankMgr.lstDirection);
                    }
                    break;
                }
                default: {
                    let bulletNode = this.fetchBulletFromPool();
                    if (bulletNode) {
                        let dest = tankMgr.lstDirection.mul(tankNode.height / 2 + 35);
                        let pos = tankNode.getPosition().add(dest);
                        bulletNode.setPosition(pos);
                        let bulletMgr: BulletMgr = bulletNode.getComponent("BulletMgr");
                        bulletMgr.init(tankMgr.color, tankMgr.level, tankMgr.lstDirection);
                    }
                    break;
                }

            }


            tankMgr.fire();
        }

        this.playFireSound();
    }

    playFireSound() {
        cc.audioEngine.playEffect(this.fireSound, false);
    }

    fetchBulletFromPool(): cc.Node {
        for (let bulletNode of this.bulletPool) {
            let bulletMgr: BulletMgr = bulletNode.getComponent("BulletMgr");
            if (!bulletMgr.active) return bulletNode;
        }
        return null;
    }

    update(dt: number) {
        for (let tankNode of this.tanks) {
            if (tankNode == null) continue;
            let tankMgr: TankMgr = tankNode.getComponent("TankMgr");
            tankMgr.direction = this.joyStickMgr.direction;
        }
    }

    private randomPos(): cc.Vec2 {
        let width = this.node.width;
        let height = this.node.height;
        let x = Math.round(Math.random() * width) - width / 2;
        let y = Math.round(Math.random() * height) - height / 2;
        return cc.v2(x, y);
    }

    resetSize(node: cc.Node) {
        let frameSize = cc.view.getFrameSize();
        let destSize = cc.view.getDesignResolutionSize();

        if (frameSize.width / frameSize.height > destSize.width / destSize.height) {
            node.width = destSize.height * frameSize.width / frameSize.height;
            node.height = destSize.height;
            node.getParent().getComponent(cc.Canvas).designResolution = cc.size(node.width, node.height);
        } else {
            node.width = destSize.width;
            node.height = destSize.width * frameSize.height / frameSize.width;
            node.getParent().getComponent(cc.Canvas).designResolution = cc.size(node.width, node.height);
        }
        // this.fitScreen(cav, destSize);
    }
}

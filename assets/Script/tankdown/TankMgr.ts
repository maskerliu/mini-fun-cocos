import { TankBodyColor, TankLevel, TankType } from "./TankModels";

const { ccclass, property } = cc._decorator;

const MAX_ROTATE_ANGLE = 60;
const MAX_RADIUS = Math.PI / 3;

@ccclass
export default class TankMgr extends cc.Component {
    @property(cc.Node)
    mainCamera: cc.Node = null;

    @property(cc.Node)
    body: cc.Node = null;

    @property(cc.Node)
    barrelMain: cc.Node = null;

    @property(cc.Node)
    barrelLeft: cc.Node = null;

    @property(cc.Node)
    barrelRight: cc.Node = null;

    @property(cc.Node)
    shotLeft: cc.Node = null;

    @property(cc.Node)
    shotRight: cc.Node = null;

    @property(cc.AudioClip)
    engineSlowSound: cc.AudioClip = null;

    rigidBody: cc.RigidBody = null;


    bodyFrameName: string = null; // tankBody_${Color}_outline
    mainBarrelFrameName: string = null; // tankBarrel_${Color}_${Type}_outline 
    subBarrelFrameName: string = null; // specialBarrel_${type}_outline
    shotFrameName: string = null; // shot${Type}



    speed: number = 150;

    fireBlink: cc.Tween = null;

    lstDirection: cc.Vec2 = null;
    direction: cc.Vec2 = null;

    type: TankType = null;
    color: TankBodyColor = null;
    level: TankLevel = null;

    playEffect: boolean = false;
    effectId: number = null;


    offset: cc.Vec2 = cc.v2(0, 0);

    onLoad() {
        this.fireBlink = cc.tween().to(0.2, { opacity: 0 }).call(() => {
            this.shotLeft.opacity = 0;
            if (this.shotRight) this.shotRight.opacity = 0;
        });
    }

    init(type: TankType, color: TankBodyColor, level: TankLevel) {
        this.type = type;
        this.color = color;
        this.level = level;

        this.rigidBody = this.node.getComponent(cc.RigidBody);

        this.node.angle = Math.random() * 360;
        this.lstDirection = cc.v2(1, 0).rotate((this.node.angle + 270) / 180 * Math.PI);

        this.bodyFrameName = `tankBody_${color}_outline`;
        this.shotFrameName = `shot_${level > TankLevel.Level_4 ? 4 : level}`;
        switch (this.type) {
            case TankType.Normal:
                this.speed = 200;
                let finalLevel = level > TankLevel.Level_3 ? 3 : level;
                this.mainBarrelFrameName = `tankBarrel_${color}_${finalLevel}_outline`;
                break;
            case TankType.Large:
                this.speed = 150;
                this.subBarrelFrameName = `specialBarrel_${level}_outline`;
                break;
            case TankType.Huge:
                this.speed = 100;
                this.mainBarrelFrameName = `specialBarrel_${level}_outline`;
                this.subBarrelFrameName = `specialBarrel_4_outline`;
                break;
        }

        cc.resources.load("tank_down/tank_down", cc.SpriteAtlas, (err, atlas: cc.SpriteAtlas) => {
            var frame = atlas.getSpriteFrame(this.bodyFrameName);
            this.body.getComponent(cc.Sprite).spriteFrame = frame;

            frame = atlas.getSpriteFrame(this.mainBarrelFrameName);
            if (this.barrelMain) this.barrelMain.getComponent(cc.Sprite).spriteFrame = frame;

            frame = atlas.getSpriteFrame(this.subBarrelFrameName);
            if (this.barrelLeft) {
                this.barrelLeft.getComponent(cc.Sprite).spriteFrame = frame;
                this.barrelLeft.scaleX = -1;
            }
            if (this.barrelRight) this.barrelRight.getComponent(cc.Sprite).spriteFrame = frame;

            frame = atlas.getSpriteFrame(this.shotFrameName);
            this.shotLeft.getComponent(cc.Sprite).spriteFrame = frame;
            if (this.shotRight) this.shotRight.getComponent(cc.Sprite).spriteFrame = frame;
        });

        this.shotLeft.opacity = 0;
        if (this.shotRight) this.shotRight.opacity = 0;
    }

    start() {
        if (this.mainCamera != null) {
            this.offset = this.mainCamera.getPosition().sub(this.node.getPosition());
        }
    }

    update(dt: number) {
        if (this.mainCamera != null) {
            this.mainCamera.x = this.node.x + this.offset.x;
            this.mainCamera.y = this.node.y + this.offset.y;
        }

        if (this.direction) {
            this.rotoate();
            this.rigidBody.linearVelocity = this.lstDirection.mul(this.speed);

            if (!this.playEffect) {
                this.effectId = cc.audioEngine.playEffect(this.engineSlowSound, true);
                this.playEffect = true;
            }
        } else {
            this.rigidBody.linearVelocity = cc.v2(0, 0);
            cc.audioEngine.stopEffect(this.effectId);
            this.playEffect = false;
        }
    }

    rotoate() {

        this.lstDirection = this.direction;
        let angle = cc.v2(1, 0).signAngle(this.lstDirection) * 180 / Math.PI;
        this.node.angle = angle - 270;
    }

    fire() {
        this.shotLeft.opacity = 255;
        cc.tween(this.shotLeft).then(this.fireBlink).start();

        if (this.shotRight) {
            this.shotRight.opacity = 255;
            cc.tween(this.shotRight).then(this.fireBlink).start();
        }
    }

    onBeginContact(contact: any, selfCollider: any, otherCollider: any) {
        this.rigidBody.linearVelocity = cc.v2(0, 0);
        this.direction = null;
    }
}

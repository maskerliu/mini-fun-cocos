import { TankBodyColor, TankLevel } from "./TankModels";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BulletMgr extends cc.Component {

    @property(cc.AudioClip)
    exploseSound: cc.AudioClip = null;

    rigidBody: cc.RigidBody = null;
    boxCollider: cc.PhysicsBoxCollider = null;

    bulletFrameName: string = null; // bullet_${color}_${type}_outline
    active: boolean = false; // 是否处于激活状态
    explosed: boolean = false; // 是否已经爆炸
    direction: cc.Vec2 = null;
    speed: number = 300;
    frames: number = 0;
    explosionAnim: cc.Animation = null;

    onLoad() {
        cc.audioEngine.setEffectsVolume(0.2);

        this.node.zIndex = cc.macro.MAX_ZINDEX;
        this.node.opacity = 0;
        this.explosionAnim = this.node.getComponent(cc.Animation);
        this.explosionAnim.on("stop", this.onAnimStop, this);
    }

    init(color: TankBodyColor, level: TankLevel, direction: cc.Vec2) {
        this.node.opacity = 255;
        this.active = true;
        this.explosed = false;
        this.frames = 0;
        this.direction = direction;

        let angle = cc.v2(1, 0).signAngle(direction) * 180 / Math.PI;
        this.node.angle = angle - 90;

        this.rigidBody = this.node.addComponent(cc.RigidBody);
        this.rigidBody.enabledContactListener = true;
        this.rigidBody.linearVelocity = this.direction.mul(this.speed);
        this.rigidBody.fixedRotation = true;
        this.boxCollider = this.node.addComponent(cc.PhysicsBoxCollider);
        this.boxCollider.size = cc.size(24, 36);
        this.boxCollider.apply();

        let finalLevel = level > TankLevel.Level_3 ? 3 : level;
        if (color == TankBodyColor.BigRed || color == TankBodyColor.DarkLarge || color == TankBodyColor.Huge) {
            this.bulletFrameName = `bullet_dark_${finalLevel}_outline`;
        } else {
            this.bulletFrameName = `bullet_${color}_${finalLevel}_outline`;
        }

        cc.resources.load("tank_down/tank_down", cc.SpriteAtlas, (err, atlas: cc.SpriteAtlas) => {
            let frame = atlas.getSpriteFrame(this.bulletFrameName);
            this.getComponent(cc.Sprite).spriteFrame = frame;
        });
    }

    update(dt: number) {
        if (!this.active) return;
        if (this.rigidBody == null) return;

        this.frames++;

        if (this.frames == 80) { // 
            if (this.rigidBody != null) this.dimiss();
        } 
    }

    destroy(): boolean {
        super.destroy();
        this.explosionAnim.off("stop", this.onAnimStop, this)
        return true;
    }

    onAnimStop() {
        this.node.opacity = 0;
        this.node.setPosition(-1000, -1000);
        this.explosionAnim.resume();
        this.active = false;
    }

    explose() {
        this.frames = 0;
        this.explosed = true;
        this.node.removeComponent(cc.RigidBody);
        this.node.removeComponent(cc.PhysicsBoxCollider);
        this.rigidBody = null;
        this.boxCollider = null;
        cc.audioEngine.playEffect(this.exploseSound, false);
        this.explosionAnim.play();
    }

    dimiss() { // 未爆炸
        this.frames = 0;
        this.explosed = true;
        this.node.removeComponent(cc.RigidBody);
        this.node.removeComponent(cc.PhysicsBoxCollider);
        this.rigidBody = null;
        this.boxCollider = null;
        this.onAnimStop();
    }

    onBeginContact(contact: any, selfCollider: any, otherCollider: any) {
        this.explose();
    }
}

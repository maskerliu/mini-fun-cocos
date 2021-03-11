const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    direction: cc.Vec2 = null;

    joyStickBtn: cc.Node = null;

    POS_ZERO: cc.Vec2 = cc.Vec2.ZERO;

    onLoad() {
        // console.log(this.node.parent.width, this.node.parent.height);
        // this.node.setPosition(cc.v2(50 - this.node.parent.width / 2, 100 - this.node.parent.height / 2));

        this.joyStickBtn = this.node.children[0];

        this.node.on("touchstart", this.onTouchStart, this);
        this.node.on("touchmove", this.onTouchMove, this);
        this.node.on("touchend", this.onTouchEnd, this);
        this.node.on("touchcancel", this.onTouchCancel, this);
    }

    onDestroy() {
        this.node.off("touchstart", this.onTouchStart, this);
        this.node.off("touchmmove", this.onTouchMove, this);
        this.node.off("touchend", this.onTouchEnd, this);
        this.node.off("touchcancel", this.onTouchCancel, this);
    }

    private onTouchStart(event: cc.Touch): void {
        let pos = this.node.convertToNodeSpaceAR(event.getLocation());
        this.joyStickBtn.setPosition(pos);
    }

    private onTouchMove(event: cc.Touch): void {
        let posDelta = event.getDelta();
        this.joyStickBtn.setPosition(this.joyStickBtn.getPosition().add(posDelta));
        this.direction = this.joyStickBtn.getPosition().normalize();
        
    }

    onTouchEnd(event: cc.Touch): void {
        this.joyStickBtn.setPosition(this.POS_ZERO);
        this.direction = null;
    }

    onTouchCancel(event: cc.Touch): void {
        this.joyStickBtn.setPosition(this.POS_ZERO);
        this.direction = null;
    }

    update(dt: number) {
        let len = this.joyStickBtn.getPosition().mag();
        let maxLen = this.node.width / 2;
        let ratio = len / maxLen;

        if (ratio > 1) {
            this.joyStickBtn.setPosition(this.joyStickBtn.getPosition().div(ratio));
        }
    }
}

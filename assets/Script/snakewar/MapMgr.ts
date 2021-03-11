const { ccclass, property } = cc._decorator;

@ccclass
export default class MapMgr extends cc.Component {

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        // this.node.active = !cc.sys.isMobile;
    }

    setTarget(target: cc.Node) {
        let follow = cc.follow(target, cc.rect(0, 0, 200, 200));
        this.node.runAction(follow);
    }

    // update (dt) {}
}

const {ccclass, property} = cc._decorator;

@ccclass
export default class playerCameraMgr extends cc.Component {
    
    target: cc.Node = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    update (dt:number) {
        if (!this.target) return;

        let worldPos = this.target.convertToWorldSpaceAR(cc.v2(0, 0));
        let newPos = this.node.parent.convertToNodeSpaceAR(worldPos);
        this.node.setPosition(newPos);
    }
}

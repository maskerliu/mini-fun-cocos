const { ccclass, property } = cc._decorator;

@ccclass
export default class NetworkStatusMgr extends cc.Component {

    @property(cc.Sprite)
    public statusIcon: cc.Sprite = null;

    @property([cc.SpriteFrame])
    statusIcons: Array<cc.SpriteFrame> = [];

    @property(cc.Label)
    networkSpeed: cc.Label = null;

    private colors: Array<cc.Color> = [
        new cc.Color(5, 199, 13), // good
        new cc.Color(255, 186, 0), // normal
        new cc.Color(234, 38, 103), // bad
        new cc.Color(150, 150, 150)
    ]

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    updateNetworkStatus(networkSpeed: number) {
        let index: number = 3;
        if (networkSpeed < 100) {
            index = 0;
        } else if (networkSpeed >= 100 && networkSpeed < 200) {
            index = 1;
        } else if (networkSpeed >= 200 && networkSpeed < 5000) {
            index = 2
        }

        this.statusIcon.spriteFrame = this.statusIcons[index];
        this.networkSpeed.string = `${networkSpeed < 5000 ? networkSpeed : '--'} ms`;
        this.networkSpeed.node.color = this.colors[index];
    }

    // update (dt) {}
}

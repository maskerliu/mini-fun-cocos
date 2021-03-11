const { ccclass, property } = cc._decorator;

const CELL_TIME: number = 0.016;

@ccclass
export default class SnakeMgr extends cc.Component {


    @property(cc.Prefab)
    foodPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    bodyPrefab: cc.Prefab = null;

    @property(cc.Node)
    center: cc.Node = null;

    @property
    bodyNum: number = 2;
    @property
    sectionLen: number = 20;
    @property
    time: number = 2;


    nowTime: number = 0;

    bodyArr: Array<cc.Node> = null;
    pointArr: Array<cc.Vec2> = null;

    direction: cc.Vec2 = null;
    lstDirection: cc.Vec2 = null;
    speed: number = 5;
    headPointsNum: number = 0;

    destPosition: cc.Vec2 = null;
    compenstationSpeed: number = 0;

    rigidBody: cc.RigidBody = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.bodyArr = [];
        this.bodyArr.push(this.node);
        this.rotateHead(this.node.getPosition());

        this.pointArr = [];

        for (let i = 1; i <= this.bodyNum; ++i) {
            this.genNewBody();
        }
        // let mgr: cc.CollisionManager = cc.director.getCollisionManager();
        // mgr.enabled = true;

        this.minCircle();

        this.rigidBody = this.node.getComponent(cc.RigidBody);
        this.rigidBody.linearDamping = 1;
    }

    start() {

    }

    update(dt: number) {

        this.nowTime += dt;
        while (this.nowTime >= CELL_TIME) {
            this.fixedUpdate(CELL_TIME)
            this.nowTime -= CELL_TIME;
        }

        if (this.direction) {
            this.lstDirection = this.direction;
            // this.rigidBody.linearVelocity = cc.v2(this.speed, this.speed);
            this.rotateHead(this.direction);
            this.move();
            this.minCircle();
        }
        // else {
        //     if (this.rigidBody.linearVelocity.x != 0 && this.rigidBody.linearVelocity.y != 0) {
        //         this.move();
        //     } else {
        //         this.lstDirection = null;
        //     }
        // }
    }

    fixedUpdate(dt: number): void {

    }

    capturePositions(): void {
        var len = this.bodyArr.length - 1;
    }

    private move(): void {
        let dest = this.direction.mul(this.speed);
        let localDestPosition = this.node.getPosition().add(dest);
        if (this.destPosition) {
            console.log(cc.Vec2.distance(localDestPosition, this.destPosition));
        }

        this.node.setPosition(localDestPosition);
        this.pointArr.push(this.node.getPosition());
        for (let i = 1; i < this.bodyArr.length; ++i) {
            this.bodyArr[i].setPosition(this.pointArr[(i - 1) * this.sectionLen / this.speed]);
            if (i == this.bodyArr.length - 1 && this.pointArr.length > this.sectionLen / this.speed * this.bodyNum) {
                this.pointArr.splice(0, 1);
            }
        }
    }

    private genNewBody(): void {
        let newBody: cc.Node = cc.instantiate(this.bodyPrefab);
        if (this.bodyArr.length == 1) {
            let dir = this.node.getPosition().normalize();
            newBody.setPosition(this.node.getPosition().sub(dir.mul(this.sectionLen)));
        } else {
            let lstBody = this.bodyArr[this.bodyArr.length - 1];
            let lstBOBody = this.bodyArr[this.bodyArr.length - 2];
            let dir = lstBOBody.getPosition().sub(lstBody.getPosition()).normalize();
            newBody.setPosition(lstBody.getPosition().sub(dir.mul(this.sectionLen)));
        }

        newBody.color = this.node.color;
        this.node.parent.addChild(newBody);
        this.bodyArr.push(newBody);
        this.pointArr.push(newBody.getPosition());

        this.recordPoints();
        this.changeZIndex();
    }

    public removeFromParent() {
        for (let node of this.bodyArr) {
            node.removeFromParent();
        }
    }

    private rotateHead(headPos: cc.Vec2): void {
        let angle = cc.v2(1, 0).signAngle(headPos) * 180 / Math.PI;
        this.node.angle = angle - 90;
    }

    private recordPoints(): void {
        let spiceSize = this.sectionLen / this.speed;

        let lstBody = this.bodyArr[this.bodyArr.length - 1];
        let lstBOBody = this.bodyArr[this.bodyArr.length - 2];

        for (var i = 1; i <= spiceSize; ++i) {
            let dir = lstBOBody.getPosition().sub(lstBody.getPosition()).normalize();
            let pos = lstBOBody.getPosition().sub(dir.mul(i * this.speed));
            this.pointArr.push(pos);
            let food = cc.instantiate(this.foodPrefab);
            food.setScale(0.1);
            food.color = this.node.color;
            food.setPosition(pos);
            this.node.parent.addChild(food)
        }
    }

    private changeZIndex(): void {
        for (let i = 0; i < this.bodyArr.length; ++i) {
            this.bodyArr[i].zIndex = cc.macro.MAX_ZINDEX - i;
        }
    }

    onCollisionEnter(other: cc.Component, self: cc.Component): void {
        console.log("collision")
        // other.node.removeFromParent();

        // let newFood = cc.instantiate(this.foodPrefab);
        // this.node.parent.addChild(newFood);

        // this.getNewBody();
    }

    onBeginContact(contact: any, selfCollider: any, otherCollider: any) {
        for (var i = 0; i < this.bodyArr.length; ++i) {
            let newFood = cc.instantiate(this.foodPrefab);
            newFood.color = this.node.color;
            newFood.setPosition(this.bodyArr[i].getPosition());
            this.node.parent.addChild(newFood);

            if (i == this.bodyArr.length - 1) this.removeFromParent();
        }
    }

    minCircle() {

        var minX = this.bodyArr[0].getPosition().x;
        var minY = this.bodyArr[0].getPosition().y;
        var maxX = this.bodyArr[0].x;
        var maxY = this.bodyArr[0].y;

        for (var i = 1; i < this.bodyArr.length; ++i) {
            minX = this.bodyArr[i].getPosition().x > minX ? minX : this.bodyArr[i].getPosition().x;
            minY = this.bodyArr[i].getPosition().y > minY ? minY : this.bodyArr[i].getPosition().y;
            maxX = this.bodyArr[i].getPosition().x < maxX ? maxX : this.bodyArr[i].getPosition().x;
            maxY = this.bodyArr[i].getPosition().y < maxY ? maxY : this.bodyArr[i].getPosition().y;
        }
        // console.log(minX, minY, maxX, maxY);
        var o: cc.Vec2 = cc.v2((maxX + minX) / 2, (maxY + minY) / 2)
        this.center.setPosition(o);
    }
}

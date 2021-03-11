const { ccclass, property } = cc._decorator;

@ccclass
export default class TankDownMapMgr extends cc.Component {

    @property(cc.Prefab)
    crateMetalPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    crateMetalSidePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    crateWoodPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    crateWoodSidePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    fenceRedPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    fenceYellowPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    sandbagBrownPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    sandbagBeigePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    treeBrownSmallPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    treeBrownLargePrefab: cc.Prefab = null;

    @property(cc.Prefab)
    treeGreenSmallPrefab: cc.Prefab = null;

    @property(cc.Prefab)
    treeGreenLargePrefab: cc.Prefab = null;

    // LIFE-CYCLE CALLBACKS:
    map: cc.TiledMap = null;

    onLoad() {
        this.map = this.node.getComponent(cc.TiledMap);
    }

    start() {

        this.generateObjects();

        // let layer = this.map.getLayer("road");
        // let layerSize = layer.getLayerSize();
        // let tileSize = this.map.getTileSize();

        // for (var i = 0; i < layerSize.width; ++i) {
        //     for (var j = 0; j < layerSize.height; ++j) {
        //         let tile = layer.getTiledTileAt(i, j, true);
        //         if (tile.gid != 0) {
        //             tile.node.group = "road";
        //             let body = tile.node.addComponent(cc.RigidBody);
        //             body.type = cc.RigidBodyType.Static;
        //             let collider = tile.node.addComponent(cc.PhysicsBoxCollider);
        //             collider.offset = cc.v2(tileSize.width / 2, tileSize.height / 2);
        //             collider.size = tileSize;
        //             collider.apply();
        //         }
        //     }
        // }
    }

    // update (dt) {}



    generateObjects() {
        let obstacleLayer = this.map.getLayer("road");
        let objGroup = this.map.getObjectGroup("objects");

        let height = this.map.getMapSize().height * this.map.getTileSize().height;
        for (let obj of objGroup.getObjects()) {
            let shieldNode: cc.Node;
            switch (obj.name) {
                case "crateWood":
                    shieldNode = cc.instantiate(this.crateWoodPrefab);
                    break;
                case "crateWoodSide":
                    shieldNode = cc.instantiate(this.crateWoodSidePrefab);
                    break;
                case "crateMetalSide":
                    shieldNode = cc.instantiate(this.crateMetalPrefab);
                    break;
                case "crateMetalSide":
                    shieldNode = cc.instantiate(this.crateMetalSidePrefab);
                    break;
                case "fenceRed":
                    shieldNode = cc.instantiate(this.fenceRedPrefab);
                    break;
                case "fenceYellow":
                    shieldNode = cc.instantiate(this.fenceYellowPrefab);
                    break;
                case "sandbagBrown":
                    shieldNode = cc.instantiate(this.sandbagBrownPrefab);
                    break;
                case "sandbagBeije":
                    shieldNode = cc.instantiate(this.sandbagBeigePrefab);
                    break;
                case "treeBrownSmall":
                    shieldNode = cc.instantiate(this.treeBrownSmallPrefab);
                    break;
                case "treeBrownLarge":
                    shieldNode = cc.instantiate(this.treeBrownLargePrefab);
                    break;
                case "treeGreenSmall":
                    shieldNode = cc.instantiate(this.treeGreenSmallPrefab);
                    break;
                case "treeGreenLarge":
                    shieldNode = cc.instantiate(this.treeGreenLargePrefab);
                    break;
            }

            if (shieldNode) {
                shieldNode.x = obj.x * 0.5;
                shieldNode.y = obj.y * 0.5;
                // shieldNode.scaleX = -1;
                shieldNode.angle = obj.rotation;
                shieldNode.zIndex = cc.macro.MAX_ZINDEX;
                obstacleLayer.addUserNode(shieldNode);
            }
        }
    }

    tilePosToCC(point: cc.Vec2): cc.Vec2 {
        let mapSize = this.map.getMapSize();
        let tileSize = this.map.getTileSize();
        let x = point.x * tileSize.width + tileSize.width / 2;
        let y = (mapSize.height - point.y) * tileSize.height - tileSize.height / 2;
        return cc.v2(x, y);
    }
}

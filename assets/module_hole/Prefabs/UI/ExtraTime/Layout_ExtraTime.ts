import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Layout_ExtraTime')
export class Layout_ExtraTime extends Component {

    @property(Node)
    content: Node = null;

    @property(Label)
    lbGetTime: Label = null!;

    @property(Node)
    btGet: Node = null!;

    @property(Node)
    btNo: Node = null!;
}



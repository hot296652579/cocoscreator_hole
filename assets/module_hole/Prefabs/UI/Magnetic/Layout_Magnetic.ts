import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Layout_Magnetic')
export class Layout_Magnetic extends Component {

    @property(Node)
    content: Node = null;

    @property(Node)
    btGet: Node = null!;

    @property(Node)
    btNo: Node = null!;
}






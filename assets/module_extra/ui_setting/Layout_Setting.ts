import { _decorator, Button, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Layout_Setting')
export class Layout_Setting extends Component {
    @property(Button)
    btnClose: Button;
}
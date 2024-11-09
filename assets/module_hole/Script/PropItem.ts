import { _decorator, CCInteger, Component, Label, Node } from 'cc';
import { PropModel } from './Model/PropModel';
const { ccclass, property } = _decorator;

export interface IPropItem{
    id:number,
    content:string,
    model:string,
    exp:number,
    weight:number
}

@ccclass('PropItem')
export class PropItem extends Component {

    @property({type:CCInteger,displayName:'道具id'})
    id:number = 1;

    content:string = null!;
    model:string = null!;
    exp:number = null!;
    weight:number = null!;

    start() {
        const propData = this.getDataByJsonId();
        this.content = propData.content;
        this.model = propData.model;
        this.exp = propData.exp;
        this.weight = propData.weight;

        console.log(`道具id:${this.id} 道具名content:${this.content} 道具exp:${this.exp} 道具重量:${this.weight}`);
    }

    getDataByJsonId():IPropItem{
        const model = new PropModel(this.id);
        const data:IPropItem = {
            id: this.id,
            content: model.content,
            model: model.model,
            exp: model.exp,
            weight: model.weight
        }
        return data;
    }
}



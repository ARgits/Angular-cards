import {Component, Input, OnInit} from '@angular/core';
import {GameService} from "../game.service";
import {ListNode} from "../../LinkedListNode";

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() cardObject: ListNode = new ListNode(null)
  @Input() index: number = 0


  constructor(private readonly game: GameService,) {
  }

  getClass() {
    let cls = `card-${this.index}`
    cls += ` ${this.cardObject?.value.stack.slice(0, this.cardObject?.value.stack.indexOf('-'))}`
    return cls
  }

  getSrc() {
    return this.cardObject.value.shown ? this.cardObject.value.srcCasing : this.cardObject.value.srcBack
  }

  ngOnInit()
    :
    void {
  }

  onDragStart({$event}: { $event: any }) {

    if (!this.cardObject) return
    const stackArr = this.game.cards!.filter(c => c.stack === this.cardObject?.value.stack)
    if (!stackArr.length) return
    const cardIndex = stackArr.findIndex(c => c.id === this.cardObject?.value.id)
    if (cardIndex === -1) return
    $event.source.data = [...stackArr.slice(cardIndex)]
  }

  canDrag() {
    const stackArr = this.game.cards!.filter(c => c.stack === this.cardObject?.value.stack)
    return (!this.cardObject?.value.shown && this.index !== stackArr.length - 1) || this.cardObject?.value.stack === 'hiddenStore'
  }

  sendToFinalStack() {
    if (this.cardObject.next) return
    const {shown, suit,} = this.cardObject.value
    if (!shown) return
    let stackId = this.game.cards?.filter(c => c.suit === suit && c.stack.includes('final'))[0]?.stack
    if (!stackId) {
      const index = [1, 2, 3, 4].reduce((previousValue, currentValue) => {
        if (this.game.cards?.filter(c => c.stack === `final-${previousValue}`).length) return currentValue
        else return previousValue
      })
      stackId = `final-${index}`
    }
    this.game.changeStack([this.cardObject.value], stackId)
  }

}

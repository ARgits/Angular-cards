import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {GameService} from "../game.service";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {Card} from "../Card";

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  animations: [
    trigger('card', [
      state('initial', style({top: '*'})),
      state('moving', style({top: '*'})),
      transition('initial=>moving', animate('1s')),
    ])
  ]
})
export class CardComponent implements OnInit {

  @Input() cardObject: Card | null = null
  @Input() index: number = 0

  constructor(private readonly game: GameService,) {
  }

  getClass() {
    let cls = `card-${this.index}`
    cls += ` ${this.cardObject?.stack.slice(0, this.cardObject?.stack.indexOf('-'))}`
    return cls
  }

  getSrc() {

    return this.cardObject?.shown ? this.cardObject.srcCasing : this.cardObject?.srcBack ?? ''
  }

  get nextCard() {
    if (this.index === this.game.cards.filter(card => card.stack === this.cardObject?.stack).length - 1) {
      return null
    }
    return this.game.cards.filter(card => card.stack === this.cardObject?.stack)[this.index + 1]
  }

  ngOnInit(): void { }

  onDragStart({$event}: {$event: any}) {

    if (!this.cardObject) {
      return
    }
    const stackArr = this.game.cards!.filter(c => c.stack === this.cardObject?.stack)
    if (!stackArr.length) {
      return
    }
    const cardIndex = stackArr.findIndex(c => c.id === this.cardObject?.id)
    if (cardIndex === -1) {
      return
    }
    $event.source.data = [...stackArr.slice(cardIndex)]
  }

  canDrag() {
    const stackArr = this.game.cards!.filter(c => c.stack === this.cardObject?.stack)
    return (!this.cardObject?.shown && this.index !== stackArr.length - 1) || this.cardObject?.stack === 'hiddenStore'
  }

  sendToFinalStack() {
    if (!this.cardObject) {
      return
    }
    const {shown, suit,} = this.cardObject
    if (!shown) {
      return
    }
    let stackId = this.game.cards?.filter(c => c.suit === suit && c.stack.includes('final'))[0]?.stack
    if (!stackId) {
      const index = [1, 2, 3, 4].reduce((previousValue, currentValue) => {
        if (this.game.cards?.filter(c => c.stack === `final-${previousValue}`).length) {
          return currentValue
        }
        else {
          return previousValue
        }
      })
      stackId = `final-${index}`
    }
    console.log(document.getElementsByClassName(stackId)[0])
    this.game.changeStack([this.cardObject], stackId)
    this.game.finalSort()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.index) {
      console.log('card changes', changes)
    }
  }

  forbidDownload() {
    return false
  }

}

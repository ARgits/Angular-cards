import {Component, Input, OnInit} from '@angular/core';
import {GameService} from "../game.service";
import {Card} from "../Card";

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input() cardObject: Card | undefined
  @Input() index: number | undefined


  constructor(private readonly game: GameService) {
  }

  getClass() {
    let cls = `card-${this.index}`
    cls += ` ${this.cardObject?.stack.slice(0, this.cardObject?.stack.indexOf('-'))}`
    return cls
  }

  ngOnInit(): void {
  }

  onDragStart({$event}: { $event: any }) {
    console.log('drag start begin')
    if (!this.cardObject) return
    console.log('card exist')
    const stackArr = this.game.cards!.filter(c => c.stack === this.cardObject?.stack)
    if (!stackArr.length) return
    console.log('stack is not empty')
    const cardIndex = stackArr.findIndex(c => c.id === this.cardObject?.id)
    if (cardIndex === -1) return
    console.log('card really exist')
    $event.source.data = [...stackArr.slice(cardIndex)]
    console.log($event.source.data)
  }

  canDrag() {
    const stackArr = this.game.cards!.filter(c => c.stack === this.cardObject?.stack)
    return (!this.cardObject?.shown && this.index !== stackArr.length - 1) || this.cardObject?.stack === 'hiddenStore'
  }
}

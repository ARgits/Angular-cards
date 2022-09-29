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

  onDragStart() {
    if (!this.cardObject) return
    const stackArr = this.game.cards!.filter(c => c.stack === this.cardObject?.stack)
    if (!stackArr.length) return
    const cardIndex = stackArr.findIndex(c => c.id === this.cardObject?.id)
    if (!cardIndex) return
  }

  canDrag() {
    const stackArr = this.game.cards!.filter(c => c.stack === this.cardObject?.stack)
    return (this.cardObject?.shown && this.index !== stackArr.length - 1) || this.cardObject?.stack === 'hiddenStore'
  }
}

import {Component, Input, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {GameService} from "../game.service";
import {Card} from "../Card";
import {AnimationService} from "../animation.service";

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @ViewChild('card') cardElement: any
  @Input() cardObject: Card | null = null
  @Input() index: number = 0


  constructor(private readonly game: GameService,
              private readonly animate: AnimationService,) {
  }


  getClass() {
    let cls = `card-${this.index}`
    cls += ` ${this.cardObject?.stack}`
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

  async sendToFinalStack() {
    if (!this.cardObject) {
      return
    }
    const {shown,} = this.cardObject
    if (!shown) {
      return
    }
    const stackId = this.game.getFinalStackForCard(this.cardObject)
    const check = this.game.checkCorrectCardPosition(this.cardObject, stackId)
    if (!check) {
      return;
    }
    this.animate.moveCard(this.cardObject, stackId, () => {
      this.game.changeStack([this.cardObject!], stackId);
      this.game.finalSort()
    })
  }

  ngAfterViewInit() {
    if (this.index === this.game.cards.length - 1) {
      console.log('card ready')
      this.game.sortCardsByStack()
    }
  }

  onOnChanges(simpleChange: SimpleChanges) {
    console.log(simpleChange)
  }
}

import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {GameService} from "../game.service";
import {Card} from "../Card";
import {AnimationService} from "../animation.service";
import gsap from "gsap";

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent implements OnInit {
  @ViewChild('card') cardElement: any
  @Input() cardObject: Card | null = null
  @Input() index: number = 0
  private selector: gsap.utils.SelectorFunc;
  private timeline: gsap.core.Timeline;
  loaded: boolean = false


  constructor(private readonly game: GameService,
              private readonly animate: AnimationService,
              private element: ElementRef) {
    this.selector = gsap.utils.selector(element)
    this.timeline = gsap.timeline({paused: true})
  }

  ngOnInit(): void {
  }

  getImgClass(type: string) {
    return `${this.cardObject?.shown ? ' hidden' : ' '} ` + type
  }

  get divClass() {
    const numberForLeftOffset = this.game.cardsLeft.findIndex(c => c.id === this.cardObject?.id)
    let cls = `card-${this.index}`
    cls += ` ${this.cardObject?.stack}`
    cls += `${this.game.loaded ? '' : ' notLoaded'}`
    cls += `${numberForLeftOffset > 0 ? ` cards3-${numberForLeftOffset}` : ''}`
    return cls
  }

  get emptyClass() {
    return `empty-${this.index} ${this.cardObject?.stack}`
  }

  get nextCard() {
    if (this.index === this.game.cards.filter(card => card.stack === this.cardObject?.stack).length - 1) {
      return null
    }
    return this.game.cards.filter(card => card.stack === this.cardObject?.stack)[this.index + 1]
  }


  onDragStart({$event}: {$event: any}) {
    console.log($event);
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

  dragDisabled() {
    const stackArr = this.game.cards!.filter(c => c.stack === this.cardObject?.stack)
    return this.game.state === 'paused' || (!this.cardObject?.shown && this.index !== stackArr.length - 1) || this.cardObject?.stack === 'hiddenStore'
  }

  async sendToFinalStack() {
    if (!this.cardObject || this.game.state === 'paused') {
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
    const move = this.animate.moveCard(this.cardObject, stackId,)
    move.eventCallback('onComplete', () => {
      this.game.changeStack([this.cardObject!], stackId);
      this.game.finalSort()
      move.revert()
    })
    this.game.state = 'paused'
    move.play()
  }

  onCardLoad() {
    if (this.index === this.game.cards.length - 1) {
      this.game.loaded = true
      this.game.sortCardsByStack()
    }
  }
}

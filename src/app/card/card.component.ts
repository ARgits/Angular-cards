import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {GameService} from "../game.service";
import {Card} from "../Card";
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


  constructor(private readonly game: GameService,) {
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

    const check = this.game.checkCorrectCardPosition(this.cardObject, stackId)
    if (!check) {
      return;
    }
    const {x,y} = document.getElementsByClassName(stackId)[0].getBoundingClientRect()
    const cardCoordinates = this.cardElement.nativeElement.getBoundingClientRect()
    const tl = gsap.timeline({yoyo: true})
    tl.set(this.cardElement.nativeElement, {css: {zIndex: 1}})
      .to(this.cardElement.nativeElement, {
        x: x - cardCoordinates.x,
        y: y - cardCoordinates.y,
        onStart:()=>{
          this.game.cardChanging=true
        },
        onComplete: () => {
          this.game.cardChanging=false
          this.game.changeStack([this.cardObject!], stackId);
          this.game.finalSort()
        },
        duration: 0.25,
      })
  }

}

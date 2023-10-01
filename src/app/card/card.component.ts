import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {GameService} from "../game.service";
import {Card} from "../Card";
import {AnimationService} from "../animation.service";
import {Draggable} from "gsap/Draggable";
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
  @Input() canDrag: boolean = false


  constructor(private readonly game: GameService,
              private readonly animate: AnimationService,
  ) {
    /* Draggable.create(this.cardElement,{
       onDragStart:()=>{
         console.log('drag start')
       }
     })*/
  }

  ngOnInit(): void {

  }

  ngOnChanges(): void {
    if (this.canDrag && this.cardElement) {
      this.configureDragNdrop()
    }
  }

  ngAfterViewInit(): void {
    if (this.canDrag) {
      this.configureDragNdrop()
    }
  }


  get divClass() {
    const numberForLeftOffset = this.game.cardsLeft.findIndex(c => c.id === this.cardObject?.id)
    let cls = `card card-${this.index}`
    cls += ` ${this.cardObject?.stack}`
    cls += `${this.game.loaded ? '' : ' notLoaded'}`
    cls += `${numberForLeftOffset > 0 ? ` cards3-${numberForLeftOffset}` : ''}`
    cls += `${this.cardObject?.shown ? ' hidden' : ''}`
    return cls
  }

  get nextCard() {
    if (this.index === this.game.cards.filter(card => card.stack === this.cardObject?.stack).length - 1) {
      return null
    }
    return this.game.cards.filter(card => card.stack === this.cardObject?.stack)[this.index + 1]
  }


  onDragStart({$event}: { $event: any }) {
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
    console.log($event)
  }

  dragDisabled() {
    const stackArr = this.game.cards!.filter(c => c.stack === this.cardObject?.stack)
    return this.game.state === 'paused' || (!this.cardObject?.shown && this.index !== stackArr.length - 1) || this.cardObject?.stack === 'hiddenStore'
  }

  configureDragNdrop() {
    const elem = this.cardElement.nativeElement
    const obj = this.cardObject
    const game = this.game
    if (obj && elem && game) {
      let elems: any[] = [elem]
      let cards: Card[] = [obj]
      Draggable.create(elem, {
//        onPressInit:function(e){
//          gsap.set(this["target"],{zIndex:0})
//        },
//        onClick:function(e){
//          gsap.set(this["target"],{zIndex:0})
//        },
        onDragStart: (_) => {
          const currentStack = obj.stack
          if (currentStack.includes('bottom')) {
            cards = this.game.cards.filter((c) => c.stack === currentStack)
            cards = cards.filter((c,i)=>c.shown&&i>=this.index)
            elems = cards.map((c) => `#${document.getElementById(c.id)?.id}`)

          }
          gsap.set(elems, {zIndex: 1})
        },
        onDrag: function (_) {
          if (elems.length > 1) {
            gsap.set(elems.filter(e => e !== `#${elem.id}`), {x: this["x"], y: this["y"]})
          }
        },
        onDragEnd: function (e: PointerEvent) {
          const {x, y} = e
          const stack = document.elementsFromPoint(x, y).filter((el) => el.className.includes('stack'))[0]?.id
          if (stack && cards.length) {
            const check = game.checkCorrectCardPosition(cards[0], stack)
            if (check) {
              game.changeStack(cards, stack)
            } else {
              console.log(elems)
              gsap.set(elems, {x: 0, y: 0, zIndex: 0})
            }
          } else {
            console.log(elems)
            gsap.set(elems, {x: 0, y: 0, zIndex: 0})
          }
        },
        force3D: true,
        zIndexBoost: false
      })
    }
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

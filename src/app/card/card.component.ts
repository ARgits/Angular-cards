import {Component, ElementRef, Input, OnInit, SimpleChanges, ViewChild} from '@angular/core';
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


  constructor(private readonly game: GameService,
              private readonly animate: AnimationService,
              private element: ElementRef) {
    this.selector = gsap.utils.selector(element)
    this.timeline = gsap.timeline({paused: true})
  }

  ngOnInit(): void {
  }

  getClass(type: string = '') {
    let cls = `card-${this.index}`
    cls += ` ${this.cardObject?.stack}`
    cls += `${this.cardObject?.shown ? ' hidden' : ' '} ` + type
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

  flipOnClick() {
    if (!this.cardObject) {
      return
    }

    this.timeline = this.animate.flipCard(this.cardObject, () => {
      const {shown} = this.cardObject!;
      const card = this.game.cards.find(c => c.id === this.cardObject!.id)
      if (!card) {
        return
      }
      console.log(card.id, card.shown, shown)
      card.shown = !shown

    })
    this.timeline.restart()


  }


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
    const move = this.animate.moveCard(this.cardObject, stackId, () => {
      this.game.changeStack([this.cardObject!], stackId);
      this.game.finalSort()
    })
    move.play()
  }

  ngAfterViewInit() {
    /* const card = this.cardElement.nativeElement
     const selector = gsap.utils.selector(card)
     const first = selector(`${this.cardObject!.shown ? '.front' : '.back'}`)
     const second = selector(`${this.cardObject!.shown ? '.back' : '.front'}`)
     gsap.set(card, {
       transformStyle: 'preserve-3d',
       transformPerspective: 1000,
     })
     gsap.set(second, {rotationY: -180,})
     this.timeline.to(first, {duration: 1, rotationY: 180})
         .to(second, {duration: 1, rotationY: 0}, 0)
         .to(card, {z: 50}, 0)
         .to(card, {z: 0}, 0.5)
     const complete = () => {
       const {shown} = this.cardObject!;
       const card = this.game.cards.find(c => c.id === this.cardObject!.id)
       if (!card) {
         return
       }
       console.log(card.id, card.shown, shown)
       card.shown = !shown
       const front = selector('.front')[0]
       console.log(front)
       front.removeAttribute('style')
     }
     this.timeline.eventCallback('onComplete', complete)
     this.timeline.eventCallback('onReverseComplete', complete)
     //this.timeline = this.animate.flipCard(this.cardObject!, complete)*/
    /*this.timeline = this.animate.flipCard(this.cardObject!, () => {
      const {shown} = this.cardObject!;
      const card = this.game.cards.find(c => c.id === this.cardObject!.id)
      if (!card) {
        return
      }
      console.log(card.id, card.shown, shown)
      card.shown = !shown
      this.timeline.revert()
    })*/
    if (this.index === this.game.cards.length - 1) {
      console.log('card ready')
      this.game.sortCardsByStack()
    }
  }

  ngAfterViewChecked() {
  }

  ngOnChanges(simpleChange: SimpleChanges) {
  }
}

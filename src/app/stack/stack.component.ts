import {Component, Input, OnInit} from '@angular/core';
import {GameService} from "../game.service";
import {CdkDragDrop,} from "@angular/cdk/drag-drop";

@Component({
  selector: 'app-stack',
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.scss']
})
export class StackComponent implements OnInit {
  @Input() stackId: string = ''
  readonly storeMaxNumberOfCards: {[key: string]: number};


  constructor(private readonly game: GameService,) {
    this.storeMaxNumberOfCards = {
      Store: 52,
      final: 13,
      bottom: 20
    }
  }

  ngOnInit(): void {
  }

  get maxNumberOfCards() {
    for (const [key, value] of Object.entries(this.storeMaxNumberOfCards)) {
      if (this.stackId.includes(key)) {
        return Array(value).fill(null).map((c, index) => index)
      }
    }
    return []
  }
cardsLeft(num:number){
    if(!this.gameMode) return ''
  return `cards3-${num - this.stackArr.length}`
}

  get gameMode() {
    return this.game.gameMode
  }

  get stackArr() {
    if (this.game.cards) {
      return this.game.cards.filter((c) => c.stack === this.stackId)
    }
    return []
  }

  getClass() {
    let cls: string = 'stack'
    cls += ` ${this.stackId}`
    cls += ` length-${this.stackArr.length}`
    return cls
  }

  async click($event: MouseEvent) {
    $event.preventDefault()
    if (this.stackId !== "hiddenStore" || this.game.state === 'paused') {
      return
    }
    this.game.state = 'paused'
    const lastCards = this.game.gameMode ? this.stackArr.slice(-3).reverse() : this.stackArr.slice(-1)
    if (!lastCards.length) {
      await this.game.refreshHiddenStore()
    }
    else {
      this.game.getFromHiddenStore(lastCards)
    }
  }

  whereCanDrop() {
    if (!this.stackId || this.stackId === 'hiddenStore') {
      return []
    }
    const dropList = new Set([...this.game.stacks].filter((stack) => !stack.includes('store')))
    return [...dropList]
  }

  onDrop($event: CdkDragDrop<any>) {
    if ($event.previousContainer === $event.container) {
      return
    }
    const cards = $event.item.data
    const check = this.game.checkCorrectCardPosition(cards[0], this.stackId)
    if (check) {
      this.game.changeStack(cards, this.stackId)
    }
  }
}

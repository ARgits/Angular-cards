import {Component, Input, OnInit} from '@angular/core';
import {GameService} from "../game.service";
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import LinkedList from "../../LinkedListNode";

@Component({
  selector: 'app-stack',
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.scss']
})
export class StackComponent implements OnInit {
  @Input() stackId: string = ''

  get stackArr() {
    const stack = this.game.cards!.filter((c) => c.stack === this.stackId)
    return new LinkedList(stack)
  }

  constructor(private readonly game: GameService) {
  }

  ngOnInit(): void {
  }

  getClass() {
    let cls: string = 'stack'
    cls += this.stackArr.empty() ? " empty" : ""
    cls += ` ${this.stackId}`
    cls += ` length-${this.stackId.includes('bottom') ? this.stackArr.size : 0}`
    return cls
  }

  async click($event: MouseEvent) {
    $event.preventDefault()
    if (this.stackId !== "hiddenStore") return
    const lastCard = this.stackArr.last?.value
    if (!lastCard) return this.game.refreshHiddenStore()
    await this.game.getFromHiddenStore(lastCard)
  }

  whereCanDrop() {
    if (!this.stackId || this.stackId === 'hiddenStore') return []
    const dropList = new Set(this.game.stacks.filter((stack) => !stack.includes('store')))
    return [...dropList]
  }

  onDrop($event: CdkDragDrop<any>) {
    //console.log($event)
    if ($event.previousContainer === $event.container) return
    const cards = $event.item.data
    this.game.changeStack(cards, this.stackId)
  }
}

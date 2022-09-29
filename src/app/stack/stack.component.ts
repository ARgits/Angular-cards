import {Component, Input, OnInit} from '@angular/core';
import {GameService} from "../game.service";
import {CdkDragDrop} from "@angular/cdk/drag-drop";
import {Card} from "../Card";

@Component({
  selector: 'app-stack',
  templateUrl: './stack.component.html',
  styleUrls: ['./stack.component.scss']
})
export class StackComponent implements OnInit {
  @Input() stackId: string = ''

  get stackArr() {
    return this.game.cards!.filter(c => c.stack === this.stackId)
  }

  constructor(private readonly game: GameService) {
  }

  ngOnInit(): void {
  }

  getClass() {
    let cls: string = 'stack'
    cls += this.stackArr.length === 0 ? " empty" : ""
    cls += ` ${this.stackId}`
    cls += ` length-${this.stackId.includes('bottom') ? this.stackArr.length : 0}`
    return cls
  }

  async click($event: MouseEvent) {
    $event.preventDefault()
    if (this.stackId !== "hiddenStore") return
    const lastCard = this.stackArr.at(-1)
    if (!lastCard) return this.game.refreshHiddenStore()
    await this.game.getFromHiddenStore(lastCard)
  }

  whereCanDrop() {
    if (!this.stackId || this.stackId === 'hiddenStore') return []
    return this.game.stacks.filter(stack => !stack.includes('store'))
  }

  onDrop($event: CdkDragDrop<any>) {
    console.log($event)
    if ($event.previousContainer === $event.container) return
    const card = <Card>$event.item.data
    this.game.changeStack(card, this.stackId)
  }
}

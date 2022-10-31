import {Injectable} from '@angular/core';
import {Card} from "./Card";
import {SupabaseService} from "./supabase.service";
import {FileObject} from "@supabase/storage-js";
import {VictoryDialogComponent} from "./victory-dialog/victory-dialog.component";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Session} from "@supabase/supabase-js";
import {TimerService} from "./timer.service";
import gsap from "gsap";

@Injectable({
  providedIn: 'root'
})
export class GameService {
  cards: Card[] = []
  numberOfCards: number = 52
  numberOfStack: number = 7
  suit: string[] = ['clubs', 'diamonds', 'spades', 'hearts']
  casing: string[] = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king']
  theme: string
  cardsBucketData: FileObject[] | undefined
  stacks: string[] = ['hiddenStore', 'shownStore', 'final-1', 'final-2', 'final-3', 'final-4']
  dialogRef: MatDialogRef<any> | null = null;
  session: Session | null = null
  state: string = 'paused'
  cardChanging: boolean = false

  get user() {
    return this.session?.user
  }

  constructor(private readonly supabase: SupabaseService,
              public dialog: MatDialog,
              private readonly timer: TimerService) {
    this.theme = 'default'
    supabase.getSession().then(({data: {session}}) => this.session = session)

  }

  set gameFinished(isFinished: boolean) {
    if (isFinished) {
      this.callVictoryDialog()
      this.state = 'paused'
      if (this.user) {
        const {timeRecords} = this.user.user_metadata
        timeRecords.push(this.timer.gameTime)
        const timeBest = Math.min(...timeRecords)
        this.supabase.updateUser({timeRecords, timeBest}).then((value) => console.log('user data successfully updated: ', value))
      }
    }
  }

  set cardsTheme(theme: string
  ) {
    this.startGame(theme).then(() => {
      console.log('Game has Started')

    })
  }

  async startGame(theme: string) {
    try {
      console.log('creation cards')
      this.createCards()
      if (!this.cards.length) {
        return
      }
      this.shuffle()
      this.sortCardsByStack()
      const cardsBucket = await this.supabase.cards
      const {data} = await cardsBucket.list(theme)
      if (!data) {
        return
      }
      this.cardsBucketData = data
      console.log(data)
      for (const card of this.cards) {
        card.srcCasing = await this.getCardSRC(card)
        card.srcBack = <string>(await this.supabase.downLoadImage("default/Card_back.svg")).data.publicUrl
      }
      this.state = 'active'
      this.timer.gameTime = 0
    } catch ({message}) {
      console.error('Error getting cards from Cards Game object:  ', message)
    }
  }

  restartGame() {
    if (!this.cards.length) {
      this.startGame('default').then(() => console.log('Game has Started'))
    }
    else {
      this.createCards()
      this.shuffle()
      this.sortCardsByStack()
      this.state = 'active'
      this.timer.gameTime = 0
    }
  }

  async getCardSRC(card: Card) {
    if (!this.cardsBucketData) {
      return "default/Card_back.svg"
    }
    const dataCard = this.cardsBucketData.find(item => item.name.includes(card.casing) && item.name.includes(card.suit))
    const src = dataCard ? `${this.theme}/${dataCard.name}` : "default/Card_back.svg"
    return <string>(await this.supabase.downLoadImage(src)).data.publicUrl
  }

  createCards() {
    if (this.cards.length) {
      for (const card of this.cards) {
        card.shown = false
      }
    }
    else {
      for (const s of this.suit) {
        for (const [index, c] of this.casing.entries()) {
          const color = s === 'diamonds' || s === 'hearts' ? "red" : "black"
          const card: Card = {
            suit: s,
            casing: c,
            id: `${c}_of_${s}`,
            height: 200,
            width: 138,
            priority: index,
            srcCasing: '',
            stack: '',
            shown: false,
            color,
            srcBack: ''
          }
          this.cards.push(card)
        }
      }
    }
  }

  sortCardsByStack() {
    const cardsDistribution = ([] as number[]).concat(...Array(this.numberOfStack).fill(null).map((item, index) => Array(index + 1).fill(null).map(() => index + 1)))
    for (const [index, card] of this.cards.entries()) {
      if (index < cardsDistribution.length) {
        const num = cardsDistribution[index]
        const isLast = cardsDistribution[index + 1] !== num
        card.stack = `bottom-${num}`
        this.stacks.push(`bottom-${num}`)
        card.shown = isLast
      }
      else {
        card.stack = `hiddenStore`
      }
    }

  }

  shuffle() {
    if (!this.cards.length) {
      return console.error('cards object not defined')
    }
    const newCards = [...this.cards]
    let m = newCards.length, t, i
    while (m) {
      i = Math.floor(Math.random() * m--)
      t = newCards[m]
      newCards[m] = newCards[i]
      newCards[i] = t
    }
    this.cards = [...newCards]
  }

  async getFromHiddenStore(card: Card) {
    const index = this.cards.findIndex(c => c.id === card.id)
    if (!index) {
      return
    }
    this.cards.splice(index, 1)
    card.shown = true
    card.stack = 'shownStore'
    this.cards.push(card)
  }

  async refreshHiddenStore() {
    const shownStore = this.cards.filter(c => c.stack === 'shownStore')
    for (let card of shownStore) {
      const index = this.cards.findIndex(c => c.id === card.id)
      if (index) {
        this.cards.splice(index, 1)
        card.stack = 'hiddenStore'
        card.shown = false
      }
    }
    this.cards = [...this.cards, ...shownStore.reverse()]
  }

  checkCorrectCardPosition(movingCard: Card, newStack: string) {
    const stackPriority = newStack.includes('final') ? -1 : 1
    const lastCard = this.cards.filter(c => c.stack === newStack).at(-1)
    if (lastCard) {
      const {color, suit, priority} = lastCard
      if (stackPriority === 1 && color === movingCard.color) {
        console.error(`wrong color: ${stackPriority}, ${color}, ${movingCard.color}`)
        return false
      }
      if (stackPriority === -1 && suit !== movingCard.suit) {
        console.error(`wrong suit in final stack: ${stackPriority}, ${suit}, ${movingCard.suit}`)
        return false
      }
      if (priority - movingCard.priority !== stackPriority) {
        console.error(`wrong priority: ${stackPriority}, ${priority}, ${movingCard.priority}`)
        return false
      }
    }
    else if ((movingCard.casing !== 'king' && stackPriority === 1) || (movingCard.casing !== 'ace' && stackPriority === -1)) {
      console.error(`you can't put card on empty stack if it not king or ace (if priority===-1): ${stackPriority}, ${movingCard.casing}`)
      return false
    }
    return true
  }

  // @ts-ignore
  async changeStack(cards: Card[], newStack: string) {
    if (this.cardChanging) {
      return console.error(`other card already changing`)
    }
    console.log('start of changeStack method')
    const oldStack = cards[0].stack
    const priority = newStack.includes('final') ? -1 : 1
    //console.log(lastCard)
    const check = this.checkCorrectCardPosition(cards[0], newStack)
    if (!check) {
      return
    }
    for (const card of cards) {
      //console.log(card)
      const cardIndex = this.cards.findIndex(c => c.id === card.id)
      this.cards?.splice(cardIndex, 1)
      card.stack = newStack
    }
    const previousStackNewLastCard = this.cards.filter(c => c.stack === oldStack).at(-1)
    if (previousStackNewLastCard) {
      const previousStackNewLastCardIndex = this.cards.findIndex(c => c.id === previousStackNewLastCard.id)
      this.cards.splice(previousStackNewLastCardIndex, 1)
      previousStackNewLastCard.shown = true
    }
    const newCards = <Card[]>[...cards, previousStackNewLastCard].filter(c => c).sort((a, b) => (priority * (b!.priority - a!.priority)))
    this.cards = [...this.cards, ...newCards]
    this.cardChanging = false
    this.gameFinished = this.cards.length === this.cards.filter(card => card.stack.includes('final')).length
  }

  finalSort(excludeStack: string[] = []) {
    const storeLength = this.cards.filter((card) => card.stack.includes('Store')).length
    if (storeLength) {
      return
    }
    const hiddenBottomCards = this.cards.filter((card) => card.stack.includes('bottom') && !card.shown).length
    if (hiddenBottomCards) {
      return
    }
    const bottomCards = this.cards.filter((card) => card.stack.includes('bottom') && !excludeStack.includes(card.stack))
    if (bottomCards.length) {
      const lastCard = bottomCards.at(-1)!
      const {priority, stack} = this.cards.filter((card) =>
        card.stack.includes('final') && card.suit === lastCard.suit).at(-1)!
      if (lastCard.priority - priority === 1) {
        const lastCardIndex = this.cards.filter(c => c.stack === lastCard.stack).length - 1
        const cardElement = document.getElementsByClassName(`${lastCard.stack} card-${lastCardIndex}`)[0]
        const cardElementXandY = cardElement.getBoundingClientRect()
        const {x, y} = document.getElementsByClassName(stack)[0].getBoundingClientRect()
        const tl = gsap.timeline()
        tl.set(cardElement, {css: {zIndex: 1}})
          .to(cardElement, {
            x: x - cardElementXandY.x,
            y: y - cardElementXandY.y,
            onStart: () => {this.cardChanging = true},
            onComplete: () => {
              this.cardChanging=false
              this.changeStack([lastCard], stack).then(() => console.log(lastCard.id, 'was moved to ', stack, ' stack'))
              this.finalSort()
            },
            duration: .25,
          })
      }
      else {
        excludeStack.push(lastCard.stack)
        this.finalSort(excludeStack)
      }
    }
  }

  callVictoryDialog() {
    this.dialogRef = this.dialog.open(VictoryDialogComponent, {
      id: 'victoryDialog',
      width: '25vw',
      height: '25vh',
    })
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null
    })
  }
}

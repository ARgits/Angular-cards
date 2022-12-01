import {Injectable} from '@angular/core';
import {Card} from "./Card";
import {SupabaseService} from "./supabase.service";
import {FileObject} from "@supabase/storage-js";
import {VictoryDialogComponent} from "./victory-dialog/victory-dialog.component";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Session} from "@supabase/supabase-js";
import {TimerService} from "./timer.service";
import {AnimationService} from "./animation.service";
import {shuffle} from "./utils"
import gsap from "gsap";

@Injectable({
  providedIn: 'root'
})
export class GameService {
  //массив их всех карт
  cards: Card[] = []
  //numberOfCards: number = 52
  //кол-во нижних стопок
  numberOfStack: number = 7
  //массив мастей
  suit: string[] = ['clubs', 'diamonds', 'spades', 'hearts']
  //массив названия карт
  casing: string[] = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king']
  //TODO:заглушка под тему
  theme: string
  //загруженные изображения карт
  cardsBucketData: FileObject[] | undefined
  //название всех стопок
  stacks: Set<string> = new Set(['hiddenStore', 'shownStore', 'final-1', 'final-2', 'final-3', 'final-4'])
  dialogRef: MatDialogRef<any> | null = null;
  session: Session | null = null
  //игра на паузе или нет TODO:подумать над другими состояниями кроме 'paused' и 'active'
  state: string = 'paused'
  cardChanging: boolean = false
  //проверка, загружены ли карты
  loaded: boolean = false
  //режим карты, 0 - стандартный, 1 - режим "3 карты"
  gameMode = 0
  //при режиме 3-х карт, какие карты должны быть показаны
  cardsLeft: Card[] = []
  //распределение карт в нижних стопках на старте игры.
  readonly cardsDistribution: number[] = []

  get user() {
    return this.session?.user
  }

  constructor(private readonly supabase: SupabaseService,
              public dialog: MatDialog,
              private readonly timer: TimerService,
              private readonly animate: AnimationService) {
    this.theme = 'webp'
    supabase.getSession().then(({data: {session}}) => this.session = session)
    this.cardsDistribution = ([] as number[]).concat(...Array(this.numberOfStack).fill(null).map((item, index) => Array(index + 1).fill(null).map(() => index + 1)))
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

  set cardsTheme(theme: string) {
    this.startGame(theme).then()
  }

  async startGame(theme: string) {
    try {
      this.createCards()
      if (!this.cards.length) {
        return
      }
      this.shuffle()
      const cardsBucket = await this.supabase.cards
      const {data} = await cardsBucket.list(theme)
      if (!data) {
        return
      }
      this.cardsBucketData = data
      for (const card of this.cards) {
        card.srcCasing = await this.getCardSRC(card)
        card.srcBack = <string>(await this.supabase.downLoadImage("webp/Card_back.webp")).data.publicUrl
      }

    } catch ({message}) {
      console.error('Error getting cards from Cards Game object:  ', message)
    }
  }

  restartGame() {
    if (!this.cards.length) {
      this.startGame('webp').then()
    }
    else {
      this.state = 'paused'
      const collectCardsAnimation = this.animate.returnToHiddenStore(
        () => {
          this.cards.forEach(c => {
            c.stack = 'hiddenStore';
            c.shown = false
          })
          this.shuffle()
          collectCardsAnimation.revert()
        })
      collectCardsAnimation.play()
    }
  }

  async getCardSRC(card: Card) {
    if (!this.cardsBucketData) {
      return "webp/Card_back.webp"
    }
    const dataCard = this.cardsBucketData.find(item => item.name.includes(card.casing) && item.name.includes(card.suit))
    const src = dataCard ? `${this.theme}/${dataCard.name}` : "webp/Card_back.webp"
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
            casing: c,
            color,
            height: 200,
            id: `card_${c}_of_${s}`,
            priority: index,
            shown: false,
            srcBack: '',
            srcCasing: '',
            stack: 'hiddenStore',
            suit: s,
            width: 138
          }
          this.cards.push(card)
        }
      }
    }
  }

  sortCardsByStack() {
    const cards = this.cardsDistribution.map((num, index, arr) => {
      const card = this.cards.at(-(index + 1))!
      const stack = `bottom-${num}`
      const shown = num !== arr[index + 1]
      return {...card, stack, shown}
    })
    const animation = this.animate.newGameAnimation(cards)
    animation.eventCallback('onComplete', () => {
      cards.forEach((c, index) => {
        const card = this.cards.at(-(index + 1))!
        card.shown = c.shown
        card.stack = c.stack
        this.stacks.add(c.stack)
      })
      this.cards.reverse()
      this.state = 'active'
      this.timer.gameTime = 0
      animation.revert()
    })
    animation.play()
  }

  shuffle() {
    if (!this.cards.length) {
      return console.error('cards object not defined')
    }

    this.cards = shuffle(this.cards)
  }

  getFromHiddenStore(cards: Card[]) {
    console.log(cards)
    if (!cards) {
      return
    }
    if (this.gameMode) {
      const anim = gsap.timeline({paused: true});
      cards.forEach((card) => {
        const move = this.animate.moveCard(card, 'shownStore')
        const flip = this.animate.flipCard(card)
        flip.add(move.paused(false), "<+=50%")
        anim.add(flip.paused(false))
      })
      anim.eventCallback('onComplete', () => {
        this.changeStack(cards, 'shownStore')
        this.state = 'active'
        this.cardsLeft = cards
        console.log(this.cardsLeft)
        anim.revert()
      })
      anim.play()
    }
    else {
      const card = cards[0]
      const move = this.animate.moveCard(card, 'shownStore')
      move.eventCallback('onComplete', () => {
        this.changeStack(cards, 'shownStore')
        this.state = 'active'
        move.revert()
      })
      const flip = this.animate.flipCard(card)
      flip.add(move.paused(false), "<+=50%")
      flip.play()
    }
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
    this.state = 'active'
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
  changeStack(cards: Card[], newStack: string) {
    const oldStack = cards[0].stack
    const priority = newStack.includes('final') ? -1 : 1
    for (const card of cards) {
      const cardIndex = this.cards.findIndex(c => c.id === card.id)
      const cardsLeftIndex = this.cardsLeft.findIndex(c => c.id === card.id)
      this.cards?.splice(cardIndex, 1)
      if (cardsLeftIndex >= 0 && !newStack.includes('Store')) {
        this.cardsLeft.splice(cardsLeftIndex, 1)
      }
      card.stack = newStack
      card.shown = newStack !== 'hiddenStore'
    }
    const previousStackNewLastCard = this.cards.filter(c => c.stack === oldStack && !oldStack.includes('Store')).at(-1)
    if (previousStackNewLastCard) {
      const previousStackNewLastCardIndex = this.cards.findIndex(c => c.id === previousStackNewLastCard.id)
      this.cards.splice(previousStackNewLastCardIndex, 1)
      if (!previousStackNewLastCard.shown) {
        const flip = this.animate.flipCard(previousStackNewLastCard,)
        flip.eventCallback('onComplete', () => {
          previousStackNewLastCard.shown = true
          flip.revert()
        })
        flip.play()
      }
    }
    const newCards = <Card[]>[...cards, previousStackNewLastCard].filter(c => c)
    if (!newStack.includes('Store')) {
      console.log('sorting')
      newCards.sort((a, b) => (priority * (b!.priority - a!.priority)))
    }
    console.log(newCards)
    this.cards = [...this.cards, ...newCards]
    this.gameFinished = this.cards.length === this.cards.filter(card => card.stack.includes('final')).length
  }

  finalSort() {
    const topFinalCards = [1, 2, 3, 4].map((number) => this.cards.findLast((card) => card.stack === `final-${number}`))
    const topBottomCards = [...this.stacks].filter((stack) => stack.includes('bottom') || stack === 'shownStore')
                                           .map((stack) => this.cards.findLast((card) => card.stack === stack))
                                           .filter((card) => topFinalCards.some((fCard) => (fCard?.suit === card?.suit && fCard?.priority + 1 === card?.priority) || card?.casing === 'ace'))
                                           .sort((a, b) => a?.priority - b?.priority)
    if (topBottomCards.length) {
      const card = topBottomCards[0]
      const finalStack = this.getFinalStackForCard(card)
      const move = this.animate.moveCard(card, finalStack,);
      move.eventCallback('onComplete', () => {
        this.changeStack([card], finalStack);
        if (this.cards.length !== this.cards.filter(card => card.stack.includes('final')).length) {
          this.finalSort()
        }
        move.revert()
      })
      move.play()
    }
    else {
      this.state = 'active'
    }
  }

  getFinalStackForCard(card: Card) {
    const {suit} = card
    let stackId = this.cards.filter(c => c.suit === suit && c.stack.includes('final'))[0]?.stack
    if (!stackId) {
      const index = [1, 2, 3, 4].reduce((previousValue, currentValue) => {
        if (this.cards.filter(c => c.stack === `final-${previousValue}`).length) {
          return currentValue
        }
        else {
          return previousValue
        }
      })
      stackId = `final-${index}`
    }
    return stackId
  }

  callVictoryDialog() {
    this.dialogRef = this.dialog.open(VictoryDialogComponent, {
      disableClose: true,
      id: 'victoryDialog',
      width: 'fit-content',
    })
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null
    })
  }

}

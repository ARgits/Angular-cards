import {Injectable} from '@angular/core';
import {Card} from "./Card";
import {SupabaseService} from "./supabase.service";
import {FileObject} from "@supabase/storage-js";

@Injectable({
  providedIn: 'root'
})
export class GameService {
  cards: Card[] | undefined
  numberOfCards: number = 52
  numberOfStack: number = 7
  suit: string[] = ['clubs', 'diamonds', 'spades', 'hearts']
  casing: string[] = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king']
  theme: string
  cardsBucketData: FileObject[] | undefined
  stacks: string[] = ['hiddenStore', 'shownStore', 'final-1', 'final-2', 'final-3', 'final-4']

  constructor(private readonly supabase: SupabaseService) {
    this.theme = 'default'
  }

  set cardsTheme(theme: string) {
    this.startGame(theme)
  }

  async startGame(theme: string) {
    try {
      this.createCards()
      if (!this.cards) return
      this.cards = this.shuffle(this.cards)
      this.sortCardsByStack()
      const cardsBucket = await this.supabase.cards
      const {data} = await cardsBucket.list(theme)
      if (!data) return
      this.cardsBucketData = data
      console.log(data)
      for (const card of this.cards) {
        card.src = await this.getCardSRC(card)
      }
    } catch ({message}) {
      console.error('Error getting cards from Cards Game object: ', message)
    }
  }

  async getCardSRC(card: Card) {
    if (!this.cardsBucketData) return "default/Card_back.svg"
    const dataCard = this.cardsBucketData.find(item => item.name.includes(card.casing) && item.name.includes(card.suit))
    const src = dataCard && card.shown ? `${this.theme}/${dataCard.name}` : "default/Card_back.svg"
    return <string>(await this.supabase.downLoadImage(src)).publicURL
  }

  createCards() {
    this.cards = []
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
          src: '',
          stack: '',
          shown: false,
          color
        }
        this.cards.push(card)
      }
    }
  }

  sortCardsByStack() {
    if (!this.cards) return
    const cardsDistribution = ([] as number[]).concat(...Array(this.numberOfStack).fill(null).map((item, index) => Array(index + 1).fill(null).map(() => index + 1)))
    for (const [index, card] of this.cards?.entries()) {
      if (index < cardsDistribution.length) {
        const num = cardsDistribution[index]
        const isLast = cardsDistribution[index + 1] !== num
        card.stack = `bottom-${num}`
        this.stacks.push(`bottom-${num}`)
        card.shown = isLast
      } else {
        card.stack = `hiddenStore`
      }
    }

  }

  shuffle(array: any[]) {
    let m = array.length, t, i
    while (m) {
      i = Math.floor(Math.random() * m--)
      t = array[m]
      array[m] = array[i]
      array[i] = t
    }
    return array
  }

  async getFromHiddenStore(card: Card) {
    if (!this.cards) return
    const index = this.cards.findIndex(c => c.id === card.id)
    if (!index) return
    this.cards.splice(index, 1)
    card.shown = true
    card.stack = 'shownStore'
    card.src = await this.getCardSRC(card)
    this.cards.push(card)
  }

  async refreshHiddenStore() {
    if (!this.cards) return
    const shownStore = this.cards.filter(c => c.stack === 'shownStore')
    for (let card of shownStore) {
      const index = this.cards.findIndex(c => c.id === card.id)
      if (index) {
        this.cards.splice(index, 1)
        card.stack = 'hiddenStore'
        card.shown = false
        card.src = await this.getCardSRC(card)
      }
    }
    this.cards = [...this.cards, ...shownStore.reverse()]
  }

  changeStack(card: Card, newStack: string) {
    if (!this.cards) return
    const cardIndex = this.cards.findIndex(c => c.id === card.id)
    const lastCard = this.cards.filter(c => c.stack === newStack).at(-1)
    console.log(lastCard)
    if (lastCard) {
      if (lastCard.color === card.color) return
      if (lastCard.priority - card.priority !== 1) return
    } else if (card.casing !== 'king') return

    this.cards?.splice(cardIndex, 1)
    this.cards.push({...card, stack: newStack})
  }
}

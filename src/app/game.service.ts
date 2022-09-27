import {Injectable} from '@angular/core';
import {Card} from "./Card";
import {SupabaseService} from "./supabase.service";

@Injectable({
  providedIn: 'root'
})
export class GameService {
  numberOfCards: number = 52
  numberOfStack: number = 7
  suit: string[] = ['clubs', 'diamonds', 'spades', 'hearts']
  casing: string[] = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king']

  constructor(private readonly supabase: SupabaseService) {
  }

  startGame(): Card[] {
    const cards: Card[] = []
    for (const s of this.suit) {
      for (const [index, c] of this.casing.entries()) {
        const card: Card = {
          suit: s,
          casing: c,
          id: `${c}_of_${s}`,
          height: 200,
          width: 138,
          priority: index,
          src: '',
          stack: ''
        }
        cards.push(card)
      }
    }

    return cards
  }

  shuffle(array: []) {
    let m = array.length, t, i
    while (m) {
      i = Math.floor(Math.random() * m--)
      t = array[m]
      array[m] = array[i]
      array[i] = t
    }
    return array
  }
}

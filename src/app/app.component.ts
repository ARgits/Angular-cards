import {Component, OnInit} from '@angular/core';
import {SupabaseService} from "./supabase.service";
import {FormControl, FormGroup} from "@angular/forms";
import {GameService} from "./game.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-cards';
  session = this.supabase.session

  cardTheme = 'default'
  cards = this.getCards(this.cardTheme)

  constructor
  (
    private supabase: SupabaseService,
    private game: GameService
  ) {
  }

  async getCards(theme: string) {
    const gameCards = this.game.startGame()
    const cardsBucket = await this.supabase.cards
    const {data} = await cardsBucket.list(theme)
    if (!data) return
    console.log(data)
    for (const card of gameCards) {
      card.src = data.find(item => item.name.includes(card.casing) && item.name.includes(card.suit))?.name || "Card_back.svg"
    }
    return gameCards
  }

  changeTheme({theme}: { theme: string }) {
    this.cardTheme = theme
    this.cards = this.getCards(theme)
  }

  ngOnInit() {
    this.supabase.authChanges((_, session) => (this.session = session))
    console.log(this.session)
  }
}

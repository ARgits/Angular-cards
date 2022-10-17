import {Component, OnInit} from '@angular/core';
import {SupabaseService} from "./supabase.service";
import {GameService} from "./game.service";
import pkg from "../../package.json"
import {Session} from "@supabase/supabase-js";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-cards';
  session: Session | null = null
  version = pkg.version
  cardTheme = 'default'

  get cards() {
    return this.game.cards
  }

  constructor
  (
    private supabase: SupabaseService,
    private game: GameService
  ) {
  }

  getCards(theme: string) {
    this.game.cardsTheme = theme
    return this.game.cards
  }

  changeTheme({theme}: { theme: string }) {
    this.cardTheme = theme
    this.game.cardsTheme = theme
  }

  ngOnInit() {
    this.supabase.authChanges((changeEvent, session) => {
      this.session = session;
      console.log(changeEvent, session)
    })
    console.log(this.session)
    this.game.cardsTheme = 'default'
  }

  startNewGame() {
    this.game.createCards()
    this.game.shuffle()
    this.game.sortCardsByStack()
  }

  logSessionIntoConsole() {
    if (this.session) {
      console.log(this.session)
    } else console.error('session was not found')
  }

}

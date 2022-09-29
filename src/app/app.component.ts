import {Component, OnInit} from '@angular/core';
import {SupabaseService} from "./supabase.service";
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

  get cards(){
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
    this.supabase.authChanges((_, session) => (this.session = session))
    console.log(this.session)
    this.game.cardsTheme='default'
  }


}

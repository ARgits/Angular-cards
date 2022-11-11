import {Component, EventEmitter, OnInit, Output, SimpleChanges} from '@angular/core';
import {SupabaseService} from "./supabase.service";
import {GameService} from "./game.service";
import pkg from "../../package.json"
import {Session} from "@supabase/supabase-js";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AuthComponent} from "./auth/auth.component";
import {AnimationService} from "./animation.service";
import {TimerService} from "./timer.service";
import {from} from "rxjs";
import {Card} from "./Card";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-cards';
  session: Session | null = null
  version = pkg.version
  loading: boolean = false
  dialogRef: MatDialogRef<any> | null = null;

  @Output() finishedLoading: EventEmitter<boolean> = new EventEmitter<boolean>();

  get user() {
    return this.session?.user
  }


  get cards() {
    return this.game.cards
  }

  constructor
  (
    private supabase: SupabaseService,
    private game: GameService,
    public dialog: MatDialog,
    private animate: AnimationService,
    private timer: TimerService,
  ) {

  }

  ngOnInit() {
    this.supabase.authChanges((changeEvent, session) => {
      this.session = session;
      if (this.session) {
        console.log(this.user)
      }
    })
    this.openDialog()
  }

  startNewGame() {
    this.game.restartGame()
  }

  giveCards() {
    const animation = this.animate.newGameAnimation(this.game.cardsDistribution, (id) => {
        const card = this.game.cards.filter(c => c.id === id)[0]
        //const card = this.cards[index]
        const index = this.cards.findIndex(c => c.id === id)
        const num = this.game.cardsDistribution[index]
        card.shown = this.game.cardsDistribution[index + 1] !== num
      },
      () => {
        console.log('end of new GameAnimation')
        for (const [index, num] of this.game.cardsDistribution.entries()) {
          const card = this.cards[index]
          this.game.stacks.add(`bottom-${num}`)
          card.stack = `bottom-${num}`
          card.shown = this.game.cardsDistribution[index + 1] !== num
        }
        this.game.state = 'active'
        this.timer.gameTime = 0
      })
    animation.restart()
  }

  openDialog() {
    this.game.state = 'paused'
    this.dialogRef = this.dialog.open(AuthComponent, {
      id: "loginDialog",
      width: '50vw',
      height: '50vh',
      data: {
        user: this.user
      },
      hasBackdrop: false,
    })
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null
    })
  }

  async signOut() {
    try {
      this.loading = true
      await this.supabase.signOut()
      this.session = null
    } catch (error) {
      //@ts-ignore
      alert(error.error_description || error.message)
    } finally {
      this.loading = false
    }
  }

  isButtonDisabled() {
    return this.loading || this.game.state === 'paused'
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('app changes', changes)
  }

}

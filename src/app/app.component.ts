import {Component, OnInit} from '@angular/core';
import {SupabaseService} from "./supabase.service";
import {GameService} from "./game.service";
import pkg from "../../package.json"
import {Session, User} from "@supabase/supabase-js";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AuthComponent} from "./auth/auth.component";
import {VictoryDialogComponent} from "./victory-dialog/victory-dialog.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'angular-cards';
  session: Session | null = null
  version = pkg.version
  user: User | undefined = undefined
  loading: boolean = false
  dialogRef: MatDialogRef<any> | null = null;
  unFinished: boolean = true

  get gameFinished() {
    if (!this.cards.length) return false
    return this.cards.length === this.cards.filter(card => card.stack.includes('final')).length;
  }

  get cards() {
    return this.game.cards
  }

  constructor
  (
    private supabase: SupabaseService,
    private game: GameService,
    public dialog: MatDialog,
  ) {
  }

  ngOnInit() {
    this.supabase.authChanges((changeEvent, session) => {
      this.session = session;
      this.user = session?.user
      console.log(changeEvent, session)

    })
    if (!this.user)
      this.openDialog()
  }

  ngDoCheck() {
    console.log(this.gameFinished)
    if (this.gameFinished && this.unFinished) {
      this.unFinished = false
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

  startNewGame() {
    this.game.restartGame()
  }
  callVictoryDialog(){
    this.dialogRef = this.dialog.open(VictoryDialogComponent, {
      id: 'victoryDialog',
      width: '25vw',
      height: '25vh',
    })
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null
    })
  }


  openDialog() {
    this.dialogRef = this.dialog.open(AuthComponent, {
      id: "loginDialog",
      width: '50vw',
      height: '50vh',
      data: {
        user: this.user
      }
    })
    this.dialogRef.afterClosed().subscribe(() => {
      this.dialogRef = null
    })
  }

  async signOut() {
    try {
      this.loading = true
      await this.supabase.signOut()
      this.user = undefined
      this.session = null
    } catch (error) {
      //@ts-ignore
      alert(error.error_description || error.message)
    } finally {
      this.loading = false
    }
  }

}

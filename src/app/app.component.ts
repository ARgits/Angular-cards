import {Component, OnInit} from '@angular/core';
import {SupabaseService} from "./supabase.service";
import {GameService} from "./game.service";
import pkg from "../../package.json"
import {Session} from "@supabase/supabase-js";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AuthComponent} from "./auth/auth.component";
import {timer} from "rxjs";

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
  timerStr: string = '00:00:00'

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
    public dialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.supabase.authChanges((changeEvent, session) => {
      this.session = session;
    })
    if (!this.session) {
      this.supabase.getSession().then(value => {
        this.session = value.data.session;
        if (!this.user) {
          this.openDialog()
        }
      })
    }
    const convertToTime = () => {
      if (this.game.state === 'active' && !document.hidden) {
        const time = this.game.gameTime
        const hours = Math.floor(time / 3600)
        const hoursStr = hours.toString().padStart(2, '0')
        const minutes = Math.floor((time - (hours * 3600)) / 60)
        const minutesStr = minutes.toString().padStart(2, '0')
        const seconds = time - (hours * 3600) - (minutes * 60)
        const secondsStr = seconds.toString().padStart(2, '0')
        this.timerStr = `${hoursStr}:${minutesStr}:${secondsStr}`
        this.game.gameTime++
      }
    }
    const source = timer(1000, 1000)
    source.subscribe(() => convertToTime())
  }


  startNewGame() {
    this.game.restartGame()
  }


  openDialog() {
    this.game.state = 'paused'
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
      this.session = null
    } catch (error) {
      //@ts-ignore
      alert(error.error_description || error.message)
    } finally {
      this.loading = false
    }
  }

}

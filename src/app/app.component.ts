import {Component, OnInit,} from '@angular/core';
import {SupabaseService} from "./supabase.service";
import {GameService} from "./game.service";
import pkg from "../../package.json"
import {Session} from "@supabase/supabase-js";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {AuthComponent} from "./auth/auth.component";
import {LeaderBoardComponent} from "./leader-board/leader-board.component";
import {NewGameDialogComponent} from "./new-game-dialog/new-game-dialog.component";

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

  get user() {
    return this.session?.user
  }


  get cards() {
    return this.game.cards
  }

  constructor(private supabase: SupabaseService,
              private game: GameService,
              public dialog: MatDialog,) { }

  get gameMode() {
    return this.game.gameMode
  }

  ngOnInit() {
    this.supabase.authChanges((changeEvent, session) => {
      this.session = session;
    })
    this.openDialog()
  }

  startNewGame($event: MouseEvent) {
    if (!$event) {
      return
    }
    let x, y = 0
    if ($event.target instanceof HTMLElement) {
      const XY = $event.target.getBoundingClientRect()
      x = XY.x
      y = XY.y
    }
    this.game.state = 'paused'
    this.dialogRef = this.dialog.open(NewGameDialogComponent, {
      id: "NewGameDialogComponent",
      position: {
        top: y + 'px',
        left: x + 'px',
      },
      disableClose:true,
      data: {
        action: 'newGame'
      }
    })
    this.dialogRef.afterClosed().subscribe(() => {
      this.game.state = 'active'
      this.dialogRef = null
    })
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
      this.game.state = 'active'
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

  openLeaderBoard() {
    this.game.state = 'paused'
    this.dialogRef = this.dialog.open(LeaderBoardComponent, {
      id: "LeaderBoardComponent",
      width: '50vw',
      height: '50vh',
      data: {
        user: this.user
      },
    })
    this.dialogRef.afterClosed().subscribe(() => {
      this.game.state = 'active'
      this.dialogRef = null
    })
  }

  changeGameMode($event: MouseEvent) {
    if (!$event) {
      return
    }
    let x, y = 0
    if ($event.target instanceof HTMLElement) {
      const XY = $event.target.getBoundingClientRect()
      x = XY.x
      y = XY.y
    }
    this.game.state = 'paused'
    this.dialogRef = this.dialog.open(NewGameDialogComponent, {
      id: "NewGameDialogComponent",
      position: {
        top: y + 'px',
        left: x + 'px',
      },
      data: {
        action: 'gamemode'
      },
      disableClose:true,
    })
    this.dialogRef.afterClosed().subscribe(() => {
      this.game.state = 'active'
      this.dialogRef = null
    })
  }
}

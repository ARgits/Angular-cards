import {Component, Inject, OnInit} from '@angular/core';
import {GameService} from "../game.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-new-game-dialog',
  templateUrl: './new-game-dialog.component.html',
  styleUrls: ['./new-game-dialog.component.scss']
})
export class NewGameDialogComponent implements OnInit {

  action = 'blank'

  constructor(private readonly game: GameService,
              @Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<NewGameDialogComponent>) {
  }

  ngOnInit(): void {
    console.log(this.data)
  }

  get actionMessage() {
    if (this.data.action === 'gamemode') {
      return 'change game mode to' + (this.game.gameMode ? ' vanilla' : ' 3 cards')
    }
    else {
      return 'start new game'
    }
  }

  newGame() {
    const mode = this.data.action === 'gamemode' ? Number(!this.game.gameMode) : this.game.gameMode
    this.game.restartGame(mode)
    this.dialogRef.close()
  }

  closeDialog() {
    this.game.state = 'active'
    this.dialogRef.close()
  }
}

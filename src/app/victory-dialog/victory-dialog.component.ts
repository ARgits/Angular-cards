import {Component, OnInit} from '@angular/core';
import {GameService} from "../game.service";
import {MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-victory-dialog',
  templateUrl: './victory-dialog.component.html',
  styleUrls: ['./victory-dialog.component.scss']
})
export class VictoryDialogComponent implements OnInit {

  constructor(private readonly game: GameService,
              public dialogRef: MatDialogRef<VictoryDialogComponent>) {
  }

  ngOnInit(): void {
  }

  newGame() {
    this.game.restartGame()
    this.dialogRef.close()
  }
}

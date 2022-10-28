import {Component, OnInit} from '@angular/core';
import {timer} from "rxjs";
import {GameService} from "../game.service";
import {TimerService} from "../timer.service";

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit {
  time: string = '00:00:00'

  constructor(private readonly game: GameService,
              private readonly timer: TimerService) { }

  ngOnInit(): void {
    const convertToTime = () => {
      if (this.game.state === 'active' && !document.hidden) {
        const time = this.timer.gameTime
        const hours = Math.floor(time / 3600)
        const hoursStr = hours.toString().padStart(2, '0')
        const minutes = Math.floor((time - (hours * 3600)) / 60)
        const minutesStr = minutes.toString().padStart(2, '0')
        const seconds = time - (hours * 3600) - (minutes * 60)
        const secondsStr = seconds.toString().padStart(2, '0')
        this.time = `${hoursStr}:${minutesStr}:${secondsStr}`
        this.timer.gameTime++
      }
    }
    const source = timer(1000, 1000)
    source.subscribe(() => convertToTime())
  }

}

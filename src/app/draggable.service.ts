import { Injectable } from '@angular/core';
import { gsap } from "gsap";
import {Draggable} from "gsap/Draggable"

@Injectable({
  providedIn: 'root'
})
export class DraggableService {

  constructor() {
    gsap.registerPlugin(Draggable)
    Draggable.create('.card')
  }
}

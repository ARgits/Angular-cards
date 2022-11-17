import {Injectable} from '@angular/core';
import {Card} from "./Card";
import gsap from "gsap";

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private _isActive: boolean
  returnCardsAnimation: gsap.core.Timeline | null;

  constructor() {
    this._isActive = false
    this.returnCardsAnimation = null
    //gsap.ticker.lagSmoothing(1000, 16)
  }

  get isActive() {
    return this._isActive
  }

  set isActive(tl: any) {
    this._isActive = tl.isActive()
  }

  get hiddenStoreCoordinates() {
    return document.getElementsByClassName('stack hiddenStore')[0].getBoundingClientRect()
  }

  flipCard(card: Card,) {
    const cardElement = document.getElementById(card.id)
    const selector = gsap.utils.selector(cardElement)
    const first = selector(`${card.shown ? '.front' : '.back'}`)
    const second = selector(`${card.shown ? '.back' : '.front'}`)
    const masterTL = gsap.timeline({paused: true})
    const direction = card.shown ? 1 : -1
    masterTL.set(cardElement, {
      transformStyle: 'preserve-3d',
      transformPerspective: 1000,
    })
            .set(second, {rotationY: -180 * direction, display: 'block'})
            .to(first, {duration: 0.25, rotationY: 180 * direction * -1},)
            .to(second, {duration: 0.25, rotationY: 0,}, 0)
    //.to(cardElement, {z: 1}, 0)
    //.to(cardElement, {z: 0}, )
    //.set(cardElement, {clearProps:'transformStyle, transformPerspective'})
    ///masterTL.eventCallback('onReverseComplete', onComplete)
    return masterTL
  }

  moveCard(card: Card, newStackID: string, duration: number = .25) {
    const cardElement = document.querySelector(`#${card.id}`)
    const cardElementXandY = cardElement!.getBoundingClientRect()
    const stackElement = document.getElementById(newStackID)!
    const newCardIndex = 1
    const {x, y} = stackElement.getBoundingClientRect()
    const offsetY = newStackID.includes('bottom') ? window.innerHeight * .01 * newCardIndex * 2 : 0
    const tl = gsap.timeline({paused: true})
    this.isActive = tl
    tl.set(`div.stack:not(#${card.stack})`, {css: {zIndex: -1}})
      .to(cardElement, {
        x: x - cardElementXandY.x,
        y: y + offsetY - cardElementXandY.y,
        duration,
      })
    return tl
  }

  newGameAnimation(cardsDistribution: Card[]) {
    const masterTL = gsap.timeline({paused: true})
    masterTL.set('div.stack:not(#hiddenStore)', {css: {zIndex: -1}})
    cardsDistribution.forEach((card, index) => {
      const elem = document.getElementById(card.id)!
      const {x} = elem.getBoundingClientRect()
      const {y} = elem.getBoundingClientRect()
      const selector = gsap.utils.selector(elem)
      const first = selector('.back')
      const second = selector('.front')
      const rotation = Number(cardsDistribution[index].shown)
      const stackID = cardsDistribution[index].stack
      const stack = document.getElementsByClassName(`stack ${stackID}`)
      const stackCoordinates = stack[0].getBoundingClientRect()
      const offsetY = cardsDistribution.findIndex(value => value.stack === stackID) - index
      const duration = .25
      const position = index * 0.05
      console.log(x, stackCoordinates.x, stackID)
      masterTL.set(elem, {
        transformStyle: 'preserve-3d',
        transformPerspective: 1000,
      })
              .to(elem, {z: index}, position)
              .set(elem, {css: {zIndex: index}}, position)
              .set(second, {rotationY: -180 * rotation}, position)
              .to(elem, {
                x: stackCoordinates.x - x,
                y: stackCoordinates.y - window.innerHeight * .01 * offsetY * 2 - y,
                duration,
              }, position)
              .add(elem.id)
              .to(elem, {z: 0}, `${elem.id}-=100%`)
              .to(first, {rotationY: 180 * rotation * -1, duration}, `${elem.id}-=100%`)
              .to(second, {rotationY: 0, duration}, `${elem.id}-=100%`)
    })
    return masterTL
  }

  returnToHiddenStore(onCompleteFunc: gsap.Callback | null) {
    const cards = gsap.utils.toArray('img:not(.hiddenStore)').reverse()
    const masterTL = gsap.timeline({paused: true})
    this.isActive = masterTL
    const {x, y} = this.hiddenStoreCoordinates
    masterTL.set(cards, {css: {zIndex: 1},})
            .to(cards, {
              x: (_, elem) => {
                const elementCoordinates = elem.getBoundingClientRect()
                return x - elementCoordinates.x
              },
              y: (_, elem) => {
                const elementCoordinates = elem.getBoundingClientRect()
                return y - elementCoordinates.y
              },
              stagger: {
                each: 0.05,
                onComplete: function () {
                  //@ts-ignore
                  const target = this.targets()[0]
                  gsap.set(target, {css: {zIndex: 0}})
                }
              },
              duration: 0.25,
              onComplete: function () {
                if (onCompleteFunc) {
                  onCompleteFunc()
                }
                masterTL.revert()
              }
            })
    return masterTL
  }

  shuffle(array: any[]) {
    const newArray = [...array]
    let m = newArray.length, t, i
    while (m) {
      i = Math.floor(Math.random() * m--)
      t = newArray[m]
      newArray[m] = newArray[i]
      newArray[i] = t
    }
    return [...newArray]
  }
}

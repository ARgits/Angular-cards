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
    gsap.ticker.lagSmoothing(1000, 16)
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

  flipCard(card: Card, onComplete: () => void) {
    const cardElement = document.getElementById(card.id)
    console.log(cardElement)
    const selector = gsap.utils.selector(cardElement)
    const first = selector(`${card.shown ? '.front' : '.back'}`)
    const second = selector(`${card.shown ? '.back' : '.front'}`)
    const masterTL = gsap.timeline({paused: true})
    const direction = card.shown ? 1 : -1
    console.log(direction)
    masterTL.set(cardElement, {
      transformStyle: 'preserve-3d',
      transformPerspective: 1000,
    })
            .set(second, {rotationY: -180 * direction, opacity: 1})
            .to(first, {duration: 0.5, rotationY: 180 * direction * -1},)
            .to(second, {duration: 0.5, rotationY: 0,}, 0)
            .to(cardElement, {z: 50}, 0)
            .to(cardElement, {z: 0}, 0.25)
    masterTL.eventCallback('onComplete', () => {
      onComplete();
      masterTL.revert()
    })
    ///masterTL.eventCallback('onReverseComplete', onComplete)
    return masterTL
  }

  moveCard(card: Card, newStackID: string, onComplete = () => {}, duration: number = .25) {
    const cardElement = document.getElementById(card.id)
    console.log('start moving')
    const cardElementXandY = cardElement!.getBoundingClientRect()
    const stackElement = document.getElementsByClassName(newStackID)[0]
    const newCardIndex = 1
    const {x, y} = stackElement.getBoundingClientRect()
    const offsetY = newStackID.includes('bottom') ? window.innerHeight * .01 * newCardIndex * 2 : 0
    const tl = gsap.timeline({paused: true})
    this.isActive = tl
    tl.set(cardElement, {css: {zIndex: 1}})
      .to(cardElement, {
        x: x - cardElementXandY.x,
        y: y + offsetY - cardElementXandY.y,
        onComplete: function () {
          onComplete();
          tl.revert()
        },
        duration,
      })
    return tl
  }

  newGameAnimation(cardsDistribution: number[], onStartFunc = (index: string) => {}, onCompleteFunc: gsap.Callback) {
    console.log('start of newGameAnimation')
    const numOfStartCards = cardsDistribution.length
    const cardsElements = gsap.utils.toArray<HTMLElement>('[class*="card-"]').slice(0, numOfStartCards)
    const masterTl = gsap.timeline({paused: true})
    console.log(cardsElements, numOfStartCards)
    masterTl.set(cardsElements, {css: {zIndex: 1}})
            .to(cardsElements, {
              x: (index, elem) => {
                const {x} = elem.getBoundingClientRect()
                const stackNumber = cardsDistribution[index]
                const stack = document.getElementsByClassName(`stack bottom-${stackNumber}`)
                const stackCoordinates = stack[0].getBoundingClientRect()
                return stackCoordinates.x - x
              },
              y: (index, elem) => {
                const {y} = elem.getBoundingClientRect()
                const stackNumber = cardsDistribution[index]
                const stack = document.getElementsByClassName(`stack bottom-${stackNumber}`)
                const stackCoordinates = stack[0].getBoundingClientRect()
                const offsetY = cardsDistribution.findIndex(value => value === stackNumber) - index
                return stackCoordinates.y - window.innerHeight * .01 * offsetY * 2 - y
              },
              stagger: {
                each: 0.05,
              },
              duration: 0.25,
              onComplete: function () {
                onCompleteFunc()
                // @ts-ignore
                masterTl.revert()
              }
            })
    return masterTl
  }

  returnToHiddenStore(onCompleteFunc: gsap.Callback | null) {
    console.log('start of return to hidden store animation')
    const cards = this.shuffle(gsap.utils.toArray('img:not(.hiddenStore)'))
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

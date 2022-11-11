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

  moveCard(card: Card, newStackID: string, onComplete = () => {}, duration: number = .25) {
    const cardElement = document.getElementById(card.id)
    if (!cardElement) {
      return console.error('Card was not found: ', card)
    }
    console.log('start moving')
    const cardElementXandY = cardElement.getBoundingClientRect()
    const stackElement = document.getElementsByClassName(newStackID)[0]
    const newCardIndex = 1
    const {x, y} = stackElement.getBoundingClientRect()
    const offsetY = newStackID.includes('bottom') ? window.innerHeight * .01 * newCardIndex * 2 : 0
    const tl = gsap.timeline()
    this.isActive = tl
    tl.set(cardElement, {css: {zIndex: 1}})
      .to(cardElement, {
        x: x - cardElementXandY.x,
        y: y + offsetY - cardElementXandY.y,
        onComplete,
        duration,
      })
  }

  newGameAnimation(cardsDistribution: number[], onStartFunc = (index: string) => {}, onCompleteFunc: gsap.Callback) {
    console.log('start of newGameAnimation')
    const numOfStartCards = cardsDistribution.length
    const cardsElements = gsap.utils.toArray<HTMLElement>('[class*="card-"]').slice(0, numOfStartCards)
    const masterTl = gsap.timeline({paused: true})
    console.log(cardsElements, numOfStartCards)
    /*cardsElements.forEach((card, index) => {
      let tl = gsap.timeline()
                   .set(card, {css: {zIndex: 1}})
                   .to(card, {
                     x: () => {
                       const {x} = card.getBoundingClientRect()
                       const stackNumber = cardsDistribution[index]
                       const stack = document.getElementsByClassName(`stack bottom-${stackNumber}`)
                       const stackCoordinates = stack[0].getBoundingClientRect()
                       return stackCoordinates.x - x
                     },
                     y: () => {
                       const {y} = card.getBoundingClientRect()
                       const stackNumber = cardsDistribution[index]
                       const stack = document.getElementsByClassName(`stack bottom-${stackNumber}`)
                       const stackCoordinates = stack[0].getBoundingClientRect()
                       const offsetY = cardsDistribution.findIndex(value => value === stackNumber) - index
                       return stackCoordinates.y - window.innerHeight * .01 * offsetY * 2 - y
                     }, duration: 0.5
                   })
      masterTl.add(tl, index * 0.25)
    })
    masterTl.eventCallback('onComplete', () => {
      onCompleteFunc();
      masterTl.revert()
    })*/
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
          each: 0.1,
          /*onComplete: function () {
            // @ts-ignore
            const elem = this.targets()[0]
            //onStartFunc(elem.id)
          }*/
        },
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
    const masterTL = gsap.timeline({paused: true})
    this.isActive = masterTL
    const {x, y} = this.hiddenStoreCoordinates
    masterTL.set('img:not(.hiddenStore)', {css: {zIndex: 1}})
            .to('img:not(.hiddenStore)', {
              x: (_, elem) => {
                const elementCoordinates = elem.getBoundingClientRect()
                return x - elementCoordinates.x
              },
              y: (_, elem) => {
                const elementCoordinates = elem.getBoundingClientRect()
                return y - elementCoordinates.y
              },
              stagger: {
                each: 0.1,
              },
              onComplete: function () {
                if (onCompleteFunc) {
                  onCompleteFunc()
                }
                masterTL.revert()
              }
            })
    //masterTL.eventCallback('onComplete', onCompleteFunc)
    return masterTL
  }
}

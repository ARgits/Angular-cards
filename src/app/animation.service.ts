import {Injectable} from '@angular/core';
import {Card} from "./Card";
import gsap from "gsap";

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  constructor() {
  }

  get hiddenStoreCoordinates() {
    return document.getElementsByClassName('stack hiddenStore')[0].getBoundingClientRect()
  }

  flipCard(card: Card, duration: number = 0.15) {
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
            .to(first, {duration, rotationY: 180 * direction * -1},)
            .to(second, {duration, rotationY: 0,}, "<")
    return masterTL
  }

  moveCard(card: Card, newStackID: string, offsetIndex: number = 0, duration: number = .15) {
    const cardElement = document.querySelector(`#${card.id}`)
    const cardElementXY = cardElement!.getBoundingClientRect()
    const lastCardInHiddenStore = document.querySelector(`div.${newStackID}[class*="card-"]:last-child`)
    const lastCardIndex = lastCardInHiddenStore ? parseInt(/\d+/.exec(lastCardInHiddenStore.className)![0]) : 0
    const target = document.querySelector(`div.${newStackID}.empty-${lastCardIndex + offsetIndex}`)!
    const targetXY = target.getBoundingClientRect()
    const x = Math.floor((targetXY.x - cardElementXY.x))
    const y = Math.floor((targetXY.y - cardElementXY.y))
    const tl = gsap.timeline({paused: true})
    tl.set(cardElement, {css: {zIndex: offsetIndex}})
    tl.to(cardElement, {
      x: "+=" + x,
      y: "+=" + y,
      duration,
    })
    return tl
  }

  newGameAnimation(cardsDistribution: Card[]) {
    const duration = 0.15
    const masterTL = gsap.timeline({paused: true})
    masterTL.set('#hiddenStore', {css: {zIndex: 1}})
    for (const card of cardsDistribution) {
      const num = cardsDistribution.filter((c) => c.stack === card.stack).findIndex((c) => c.id === card.id)
      if (card.shown) {
        const flip = this.flipCard({...card, shown: false}, duration)
        masterTL.add(flip.paused(false), "<")
      }
      const move = this.moveCard({...card, stack: 'hiddenStore'}, card.stack, num, duration)
      masterTL.add(move.paused(false), ">-=50%")
    }
    return masterTL
  }

  returnToHiddenStore(cards: Card[], onCompleteFunc: gsap.Callback | null) {
    const masterTL = gsap.timeline({paused: true})
    const duration = .15
    for (const [index, card] of cards.entries()) {
      masterTL.set(`.stack#${card.stack}`, {css: {zIndex: index}}, "<")
      if (card.shown) {
        const flip = this.flipCard(card, duration)
        masterTL.add(flip.paused(false), "<")
      }
      const move = this.moveCard(card, 'hiddenStore', index, duration)
      masterTL.add(move.paused(false), ">-50%")
    }
    masterTL.eventCallback('onComplete', () => {
      if (onCompleteFunc) {
        onCompleteFunc();
      }
      masterTL.revert()
    })
    return masterTL
  }

  // getFromHiddenStore(cards: Card[], onCompleteFunc: gsap.Callback | null) {
  //   //const cardsArr = cards.map((c => document.getElementById(c.id)))
  //   const masterTL = gsap.timeline({paused: true})
  //   cards.forEach((card, index) => {
  //     const elem = document.getElementById(card.id)!
  //     const position = index * 0.05
  //     masterTL.set(elem, {
  //       transformStyle: 'preserve-3d',
  //       transformPerspective: 1000,
  //     })
  //             .to(elem, {z: index}, position)
  //             .set(elem, {css: {zIndex: index}}, position)
  //             .set(second, {rotationY: -180 * rotation}, position)
  //             .to(elem, {
  //               x: stackCoordinates.x - x,
  //               y: stackCoordinates.y - y,
  //               duration,
  //             }, position)
  //             .add(elem.id)
  //             .to(elem, {z: 0}, `${elem.id}-=100%`)
  //             .to(first, {rotationY: 180 * rotation * -1, duration}, `${elem.id}-=100%`)
  //             .to(second, {rotationY: 0, duration}, `${elem.id}-=100%`)
  //   })
  //   masterTL.eventCallback('onComplete', () => {
  //     if (onCompleteFunc) {
  //       onCompleteFunc()
  //     }
  //     masterTL.revert()
  //   })
  //   return masterTL
  // }


}

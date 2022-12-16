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

  flipCard(card: Card) {
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
            .to(first, {duration: 0.15, rotationY: 180 * direction * -1},)
            .to(second, {duration: 0.15, rotationY: 0,}, "<")
    return masterTL
  }

  moveCard(card: Card, newStackID: string, duration: number = .15) {
    const cardElement = document.querySelector(`#${card.id}`)
    const cardElementXY = cardElement!.getBoundingClientRect()
    const lastCardInHiddenStore = document.querySelector(`div.${newStackID}[class*="card-"]:last-child`)
    const lastCardIndex = lastCardInHiddenStore ? parseInt(/\d+/.exec(lastCardInHiddenStore.className)![0]) : 0
    const stackElement = document.querySelector(`div.${newStackID}.empty-${lastCardIndex}`)!
    const newCardIndex = 1
    const {x, y} = stackElement.getBoundingClientRect()
    const offsetY = newStackID.includes('bottom') ? window.innerHeight * .01 * newCardIndex * 2 : 0
    const tl = gsap.timeline({paused: true})
    tl.set(`div.stack:not(#${card.stack})`, {css: {zIndex: -1}})
      .to(cardElement, {
        x: x - cardElementXY.x,
        y: y + offsetY - cardElementXY.y,
        duration,
      })
    return tl
  }

  newGameAnimation(cardsDistribution: Card[]) {
    const masterTL = gsap.timeline({paused: true})
    console.log(cardsDistribution)
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
      const num = cardsDistribution.filter((c) => c.stack === stackID).findIndex((c) => c.id === card.id)
      const stackElem = document.getElementById(stackID)!
      const emptyNum = num + parseInt(/length-(\d+)/.exec(stackElem.className)![1])
      console.log(emptyNum)
      const stack = document.querySelector(`#${stackID} div.empty-${emptyNum}`)!
      const stackCoordinates = stack.getBoundingClientRect()
      const duration = .15
      const position = index * 0.05
      masterTL.set(elem, {
        transformStyle: 'preserve-3d',
        transformPerspective: 1000,
      })
              .to(elem, {z: index}, position)
              .set(elem, {css: {zIndex: index}}, position)
              .set(second, {rotationY: -180 * rotation}, position)
              .to(elem, {
                x: stackCoordinates.x - x,
                y: stackCoordinates.y - y,
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
    const cards = gsap.utils.toArray<Element>('[class*="card-"]:not(.hiddenStore)').reverse()
    const lastCardInHiddenStore = document.querySelector('div.hiddenStore[class*="card-"]:last-child')
    const lastCardIndex = lastCardInHiddenStore ? parseInt(/\d+/.exec(lastCardInHiddenStore.className)![0]) : 0
    const masterTL = gsap.timeline({paused: true})
    masterTL.set('[class*="card-"].hiddenStore', {css: {zIndex: 0}})
    for (const [index, card] of cards.entries()) {
      const cardCoordinates = card.getBoundingClientRect()
      const num = index + lastCardIndex
      const target = document.querySelector(`div.hiddenStore.empty-${num}`)
      if (target) {
        masterTL.set(card, {zIndex: num})
        masterTL.to(card, {
          x: target.getBoundingClientRect().x - cardCoordinates.x,
          y: target.getBoundingClientRect().y - cardCoordinates.y,
          duration: 0.15
        }, 0.05 * num)
      }
      masterTL.eventCallback('onComplete', () => {
        if (onCompleteFunc) {
          onCompleteFunc();
        }
        masterTL.revert()
      })
    }
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

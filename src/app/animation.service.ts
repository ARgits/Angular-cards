import {Injectable} from '@angular/core';
import {Card} from "./Card";
import gsap from "gsap";

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  constructor() { }

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
    tl.set(cardElement, {css: {zIndex: 1}})
      .to(cardElement, {
        x: x - cardElementXandY.x,
        y: y + offsetY - cardElementXandY.y,
        onComplete,
        duration,
      })
  }

  newGameAnimation(cardsDistribution: number[], onStartFunc = (index: number) => {}, onCompleteElemFunc = (index: number) => {},onCompleteFunc:gsap.Callback) {
    console.log('start of newGameAnimation')
    const numOfStartCards = cardsDistribution.length
    const cardsElements = Array.from(document.querySelectorAll('img.hiddenStore')).slice(0, numOfStartCards)
    const {x, y} = document.getElementsByClassName('stack hiddenStore')[0].getBoundingClientRect()
    const tl = gsap.timeline({paused: true})
    console.log(cardsElements)
    for (const [index, elem] of cardsElements.entries()) {
      const stackNumber = cardsDistribution[index]
      const childTL = gsap.timeline()
      tl.add(childTL.set(elem, {css: {zIndex: 1}})
                    .to(elem, {
                      x: () => {
                        const stackCoordinates = document.getElementsByClassName(`stack bottom-${stackNumber}`)[0].getBoundingClientRect()
                        return stackCoordinates.x - x
                      },
                      y: () => {
                        const stackCoordinates = document.getElementsByClassName(`stack bottom-${stackNumber}`)[0].getBoundingClientRect()
                        const offsetY = cardsDistribution.findIndex(value => value === stackNumber) - index
                        return stackCoordinates.y - window.innerHeight * .01 * offsetY * 2 - y
                      },
                      duration: .5,
                      onStart: () => onStartFunc(index),
                      onComplete: () => {
                        onCompleteElemFunc(index);
                        elem.removeAttribute('style')
                      }
                    }), !index ? 0 : index * 0.2)
    }
    tl.eventCallback('onComplete',onCompleteFunc)
    tl.delay(1).play()
  }

  returnToHiddenStore(cards: Card[], onCompleteForElemFunc = (id: string) => {}, onCompleteFunc: gsap.Callback | null) {
    console.log(cards)
    console.log('start of return to hidden store animation')
    const masterTL = gsap.timeline({paused: true})
    const {x, y} = document.getElementsByClassName('stack hiddenStore')[0].getBoundingClientRect()
    for (const [index, card] of cards.reverse().entries()) {
      const childTL = gsap.timeline()
      const elem = document.getElementById(card.id)!
      masterTL.add(childTL.set(elem, {css: {zIndex: 1}})
                          .to(elem, {
                            x: () => {
                              const elementCoordinates = elem.getBoundingClientRect()
                              return x - elementCoordinates.x
                            },
                            y: () => {
                              const elementCoordinates = elem.getBoundingClientRect()
                              return y - elementCoordinates.y
                            },
                            duration: .5,
                            onComplete: () => {
                              onCompleteForElemFunc(card.id);
                              elem.removeAttribute('style')
                            }
                          }), !index ? 0 : index * 0.2)
    }
    masterTL.eventCallback('onComplete', onCompleteFunc)
    masterTL.delay(1).play()
  }

//Метод был взят с форура GSAP, основное предназначение
// иметь возможность применять индекс анимируемого элемента для функций onStart и onComplete
  staggerTo(targets: any, vars: gsap.TweenVars) {
    let tl = gsap.timeline();
    targets = gsap.utils.toArray(targets);
    if (typeof (vars.stagger) === "object") {
      let staggerVars = Object.assign({}, vars.stagger),
        each = staggerVars.amount ? staggerVars.amount / targets.length : staggerVars.each || 0,
        wrap = (func: (arg0: any, arg1: any, arg2: string | object | null) => any, i: any, target: any) => () => func(i, target, targets),
        types = "onComplete,onStart,onUpdate,onReverseComplete".split(","),
        tweenVars = Object.assign({}, vars), callback;
      staggerVars.each = staggerVars.amount = tweenVars.stagger = 0;
      // @ts-ignore
      "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase".split(",").forEach(n => staggerVars[n] && (tweenVars[n] = staggerVars[n]));
      targets.forEach((target: gsap.TweenTarget, i: number) => {
        let v = Object.assign({}, tweenVars);
        // @ts-ignore
        types.forEach(type => staggerVars[type] && (v[type] = wrap(staggerVars[type], i, target)));
        tl.to(target, v, i * each);
      });
    }
    else {
      tl.to(targets, vars);
    }
    return tl;
  }
}

import {Card} from "./app/Card";

export class ListNode {
  public value: Card
  public next: ListNode | null

  constructor(val: any) {
    this.value = val;
    this.next = null;
  }
}


export default class LinkedList {
  private head: ListNode | null;

  constructor(value?: any) {
    this.head = null
    if (value instanceof Array) this.createFromArray(value)
    else this.head = {value, next: null}
  }

  get size() {
    let dummy = this.head
    let count = dummy ? 1 : 0
    while (dummy?.next) {
      dummy = dummy.next
      count++
    }
    return count
  }

  get last() {
    let dummy = this.head
    while (dummy?.next) {
      dummy = dummy.next
    }
    return dummy
  }
  get first(){
    return this.head
  }

  createFromArray(arr: any) {
    if (!(arr instanceof Array)) throw Error('provided variable type is not array')
    for (let elem of arr) {
      this.insert(elem)
    }
  }

  //finds if a value exists in the list
  exists(val: any) {
    let dummy = this.head;
    while (dummy) {
      if (dummy.value === val) return true;
      dummy = dummy.next;
    }
    return false;
  }

  //checks if list is empty
  empty() {
    return this.head == null;
  }

  //parent insert method
  insert(val: any) {
    if (this.empty()) this.head = new ListNode(val);
    else this.insertEnd(val);
  }

  //insert value in between two nodes
  insertBetween(prevNode: { next: ListNode | null; }, val: any) {
    const newNode = new ListNode(val);
    prevNode.next = newNode;
    newNode.next = prevNode.next;
  }

  //inserts value at start of list
  insertStart(val: any) {
    const newNode = new ListNode(val);
    newNode.next = this.head;
    this.head = newNode;
  }

  //inserts value at the end of the list
  insertEnd(val: any) {
    const newNode = new ListNode(val);
    let dummy = this.head;
    while (dummy?.next) {
      dummy = dummy.next;
    }
    dummy!.next = newNode;
  }

  //parent remove method
  remove(val: any) {
    let curr = this.head;
    let prev = this.head;
    //if list isn't empty
    if (!this.empty()) {
      //look for value
      while (curr) {
        //if found
        if (curr.value === val) {
          //check 3 scenarios and delete
          if (curr === this.head) this.deleteFirst();
          else if (curr.next == null) this.deleteLast(prev);
          else this.deleteBetween(prev, curr);
        }
        //update prev and curr node variables
        prev = curr;
        curr = curr.next;
      }
    }
  }

//deletes the last val given prev node
  deleteLast(prevNode: ListNode | null) {
    prevNode!.next = null;
  }

  //deletes value in between two nodes
  deleteBetween(prevNode: ListNode | null, node: ListNode) {
    prevNode!.next = node.next;
  }

  //deletes first val on list
  deleteFirst() {
    const dummy = this.head;
    this.head = dummy!.next;
  }
}

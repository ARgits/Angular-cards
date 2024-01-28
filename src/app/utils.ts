export function shuffle(array: any[]) {
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

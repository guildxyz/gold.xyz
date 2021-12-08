export default class Struct {
  constructor(properties) {
    Object.keys(properties).map((key) => {
      this[key] = properties[key]
    })
  }
}

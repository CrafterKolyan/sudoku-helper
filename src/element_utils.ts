import { ElementNotFound } from "./errors"

export class ElementUtils {
  static getExistingElementById(id: string): HTMLElement {
    const element = document.getElementById(id)
    if (element === null) {
      throw new ElementNotFound(id + " element was not found")
    }
    return element
  }
}

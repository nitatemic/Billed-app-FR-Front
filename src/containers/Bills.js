import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"

export default class {
  /**
   * The constructor function is called when the class is instantiated. It takes an object as an
   * argument and assigns the properties of that object to the class instance
   */
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  /* A function that is called when the user clicks on the button "New Bill" */
  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  /* This function is called when the user clicks on the eye icon. It gets the bill url from the icon
  and displays it in a modal. */
  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    $('#modaleFile')
    .find(".modal-body")
    .html(`<div style='text-align: center;' class="bill-proof-container"><img width=100% src=${billUrl} data-testid="modalFile" alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }


  getBills = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        // Convert object to array
        const bills = Object.values(snapshot)
        // Sort bills by date
        bills.sort((a, b) => new Date(b.date) - new Date(a.date))
        //reverse bills
        bills.reverse()
        const newBills = bills
        .map(doc => {
          try {
            return {
              ...doc,
              date: formatDate(doc.date),
              status: formatStatus(doc.status)
            }
          }
          catch (e) {
            // if for some reason, corrupted data was introduced, we manage here failing formatDate function
            // log the error and return unformatted date in that case
            console.error(e, 'for', doc)
            return {
              ...doc,
              date: doc.date,
              status: formatStatus(doc.status)
            }
          }
        })
        return newBills
      })
    }
  }
}

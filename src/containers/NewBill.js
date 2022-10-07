import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {

  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }

  FileTypeCheck = (file) => {
    const validFileType = ['jpeg', 'jpg', 'png']
    const fileExtension = file.name.split('.').pop().toLowerCase()
    const isValidExtension = validFileType.includes(fileExtension)
    return isValidExtension
  }

  /* A function that is called when the user selects a file. It is used to upload the file to the
  server and get the url of the file. */
  handleChangeFile = e => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const filePath = e.target.value.split(/\\/g)
    const fileName = filePath[filePath.length - 1]
    const formData = new FormData()
    const email = JSON.parse(localStorage.getItem("user")).email
    formData.append('file', file)
    formData.append('email', email)

    /* Check file type */
    const fileType = file.type
    if (fileType !== "image/png" && fileType !== "image/jpg" && fileType !== "image/jpeg") {
      console.error('Le fichier doit être au format jpg, jpeg ou png');
      //Add a child to justificatif to display the error message
      const justificatif = document.getElementById(`justificatif-container`)
      if (document.getElementById('error-message')) {
        return false
      } else {
        const errorMessage = document.createElement('p')
        errorMessage.id = 'error-message'
        errorMessage.innerHTML = 'Le fichier doit être au format jpg, jpeg ou png'
        errorMessage.style.color = 'red'
        errorMessage.setAttribute('data-testid', 'error-message')
        justificatif.appendChild(errorMessage)
        return false
      }
    }
    if (document.getElementById('error-message')) {
      document.getElementById('error-message').remove()
    }
    this.store
    .bills()
    .create({
      data: formData,
      headers: {
        noContentType: true
      }
    })
    .then(({ fileUrl, key }) => {
      this.billId = key
      this.fileUrl = fileUrl
      this.fileName = fileName
    }).catch(error => console.error(error))
  }

  /* A function that is called when the user submits the form. It is used to create a new bill. */
  handleSubmit = e => {
    e.preventDefault()
    console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value',
      e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email

    /*  Check if the file is a .jpg, .jpeg or .png file. */
    if (this.fileUrl && this.fileName && this.fileName.match(/.(jpg|jpeg|png)$/i)) {
      const bill = {
        email,
        type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
        name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
        date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
        pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: 'pending'
      }
      this.updateBill(bill)
      this.onNavigate(ROUTES_PATH['Bills'])
    } else {
      console.error('Le fichier doit être au format jpg, jpeg ou png');
      return
    }
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}

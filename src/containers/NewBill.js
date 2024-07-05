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

	handleChangeFile = e => {
		e.preventDefault()

		const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
		const filePath = e.target.value.split(/\\/g)
		const fileName = file.name

		if (document.getElementById('error-message')) {
			document.getElementById('error-message').remove()
		}

		if (document.getElementById('validation-message')) {
			document.getElementById('validation-message').remove()
		}

		let regex = new RegExp("(.*?)\.(jpg|jpeg|png)$");
		const justificatif = document.getElementById(`justificatif-container`)
		switch (regex.test(fileName)) {

			case false:
				this.document.querySelector(`input[data-testid="file"]`).value = ''
				justificatif.appendChild(addStatus("error",
					"Le fichier doit être au format jpg, jpeg ou png"))
				return false

			case true :
				justificatif.appendChild(addStatus("success", "Parfait, le fichier est au bon format !"))

				const formData = new FormData()
				const email = JSON.parse(localStorage.getItem("user")).email

				formData.append('file', file)
				formData.append('email', email)

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
					this.fileUrl = filePath
					this.fileName = fileName
					return true
				}).catch(error => {
						console.error(error)
						justificatif.appendChild(addStatus("error",
							"Une erreur est survenue, veuillez réessayer"))
					}
				)
		}
	}

  /* A function that is called when the user submits the form. It is used to create a new bill. */
  handleSubmit = e => {
	  e.preventDefault()
	  const email = JSON.parse(localStorage.getItem("user")).email
	  /*  Check if the file is a .jpg, .jpeg or .png file. */
	  if (this.fileUrl && this.fileName && this.fileName.match(/.(jpg|jpeg|png)$/i)) {
		  if (document.getElementById('error-message')) {
			  document.getElementById('error-message').remove()
		  }
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
      if (document.getElementById('error-message')) {
        document.getElementById('error-message').remove()
      }
      const justificatif = document.getElementById(`justificatif-container`)
		  justificatif.appendChild(addStatus("error", "Le fichier est requis"))
      return false
    }
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({ data: JSON.stringify(bill), selector: this.billId })
      .then(() => {
	      this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}

export function addStatus(type, message) {
	let DOM = document.createElement('p')
	DOM.innerText = message

	switch (type) {
		case 'error' :
			DOM.style.color = 'red'
			DOM.id = 'error-message'
			DOM.setAttribute('data-testid', 'error-message')
			break

		case 'success' :
			DOM.style.color = 'green'
			DOM.id = 'validation-message'
			DOM.setAttribute('data-testid', 'validation-message')
			break

		default:
			DOM = null
			break
	}

	return DOM
}

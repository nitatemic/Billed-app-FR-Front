import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
	constructor({ document, onNavigate, store, localStorage }) {
		this.document = document
		this.onNavigate = onNavigate
		this.store = store
		console.log('this.store', this.store)
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
		const fileName = filePath[filePath.length - 1]
		const extension = fileName.split('.').pop()

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
				console.log('File not supported')
				this.document.querySelector(`input[data-testid="file"]`).value = ''
				const errorMessage = document.createElement('p')
				errorMessage.id = 'error-message'
				errorMessage.setAttribute('data-testid', 'error-message')
				errorMessage.innerHTML = 'Le fichier doit être au format jpg, jpeg ou png'
				errorMessage.style.color = 'red'
				justificatif.appendChild(errorMessage)
				return false

			case true :
				console.log('File supported')
				const validationMessage = document.createElement('p')
				validationMessage.id = 'validation-message'
				validationMessage.setAttribute('data-testid', 'validation-message')
				validationMessage.innerHTML = "Parfait, le fichier est au bon format !"
				validationMessage.style.color = 'green'
				justificatif.appendChild(validationMessage)

				const formData = new FormData()
				const email = JSON.parse(localStorage.getItem("user")).email

				formData.append('file', file)
				console.log(file)
				console.log(...formData)
				formData.append('email', email)
				console.log(email)
				console.log(...formData)

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
					console.log(this.fileUrl)
					return true
				}).catch(error => {
						console.log(error)
						const errorMessage = document.createElement('p')
						errorMessage.id = 'error-message'
						errorMessage.setAttribute('data-testid', 'error-message')
						errorMessage.innerHTML = "Une erreur est survenue, veuillez réessayer"
						errorMessage.style.color = 'red'
						justificatif.appendChild(errorMessage)
					}
				)
		}
	}

  /* A function that is called when the user submits the form. It is used to create a new bill. */
  handleSubmit = e => {
	  e.preventDefault()
	  const email = JSON.parse(localStorage.getItem("user")).email
	  console.log(this.fileUrl)
	  console.log(this.fileName)
	  console.log(this.fileName.match(/.(jpg|jpeg|png)$/i))
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
      console.error('Il manque le fichier');
      const justificatif = document.getElementById(`justificatif-container`)
      const errorMessage = document.createElement('p')
      errorMessage.id = 'error-message'
      errorMessage.innerHTML = 'Le fichier est requis'
      errorMessage.style.color = 'red'
      errorMessage.setAttribute('data-testid', 'error-message')
      justificatif.appendChild(errorMessage)
      return false
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

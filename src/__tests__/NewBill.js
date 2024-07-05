/* Test for newBills.js and newBillsUI.js */

/**
 * @jest-environment jsdom
 */


/* ==========  Import of test libraries and modules ========== */
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
/* ========== End of test libraries and modules import ========== */

/* ==========  Import of the module to be tested ========== */
import NewBillUI from '../views/NewBillUI.js';
import NewBill, { addStatus } from '../containers/NewBill.js';
import mockStore from '../__mocks__/store';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import Router from '../app/Router.js';
/* ========== End of module import ========== */

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {

    /* ==========  Executed before each test ========== */
    beforeEach(() => {
      /* Reset the document body */
      document.body.innerHTML = '';
      const root = document.createElement('div');
      root.id = 'root';
      document.body.appendChild(root);

      /* Define the local storage */
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });

      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@test.tdl",
        })
      );

      /* Initialize the Router and simulate navigation to the NewBill page */
      Router();
      window.onNavigate(ROUTES_PATH.NewBill);
    });
    /* ==========  End of execution before each test ========== */

    /* ==========  Executed after each test ========== */
    afterEach(() => {
      localStorage.clear(); // Clear the localStorage
      jest.clearAllMocks(); // Reset all mocks
    });
    /* ==========  End of execution after each test ========== */

    /* ========== Test to check if the NewBill page is correctly displayed ========== */
    test('Then the page should render correctly', () => {
      expect(screen.getAllByText('Envoyer une note de frais')).toBeTruthy();
    });
    /* ========== End of test to check if the NewBill page is correctly displayed ========== */

    /* ========== Test to check if the icon is active and the form is displayed ========== */
    test('The mail icon should be active', async () => {
      const iconWindow = await screen.getByTestId('icon-window');
      const iconMail = await screen.getByTestId('icon-mail');
      expect(iconWindow).toBeTruthy();
      expect(iconMail).toBeTruthy();
      await waitFor(() => {
        expect(iconMail.classList.contains('active-icon')).toBeTruthy();
      });
      expect(iconWindow.classList.contains('active-icon')).toBeFalsy();
    });
    /* ========== End of test to check if the icon is active and the form is displayed ========== */

    /* ========== Test to check if the form is displayed correctly ========== */
    test(' Should be able to view the form', async () => {
      await waitFor(() => screen.getByTestId('form-new-bill'));
      const file = screen.getByTestId('file');
      const type = screen.getByTestId('expense-type');
      const name = screen.getByTestId('expense-name');
      const amount = screen.getByTestId('amount');
      const date = screen.getByTestId('datepicker');
      const vat = screen.getByTestId('vat');
      const pct = screen.getByTestId('pct');
      const commentary = screen.getByTestId('commentary');
      const btnSubmit = screen.getByTestId('btn-send-bill');
      expect(file).toBeTruthy();
      expect(type).toBeTruthy();
      expect(name).toBeTruthy();
      expect(amount).toBeTruthy();
      expect(date).toBeTruthy();
      expect(vat).toBeTruthy();
      expect(pct).toBeTruthy();
      expect(commentary).toBeTruthy();
      expect(btnSubmit).toBeTruthy();
    });
    /* ========== End of test to check if the form is displayed correctly ========== */

    /* ========== Test handleChangeFile error message ========== */
    test('Should displayed an error message when sending a file that is not an image', async () => {

      /* === Definition of functions === */
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      document.body.innerHTML = NewBillUI()

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = newBill.handleChangeFile
      /* === End of definition of functions === */


      /* === Upload of a file === */
      const fileInput = screen.getByTestId('file');
      fileInput.addEventListener('change', handleChangeFile);
      const file = new File(['(⌐□_□)'], 'chucknorris.pdf', { type: 'application/pdf' });
      await userEvent.upload(fileInput, file, { applyAccept: false });
      /* === End of upload of a file === */

      /* === Check if the error message is displayed === */
      expect(fileInput.files.item(0)).toBe(file);
      expect(screen.queryByTestId('error-message')).toBeVisible();
      expect(screen.queryByText("Le fichier doit être au format jpg, jpeg ou png"))
      /* === End of check if the error message is displayed === */
    });
    /* ========== End of test handleChangeFile error message ========== */

    /* ========== Test handleChangeFile success message ========== */
    test('Should be able to send the form with a png file', async () => {
      /* === Definition of functions === */
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      document.body.innerHTML = NewBillUI()

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = newBill.handleChangeFile
      /* === End of definition of functions === */

      /* === Completion of the form === */
      const type = screen.getByTestId("expense-type");
      const name = screen.getByTestId("expense-name");
      const amount = screen.getByTestId("amount");
      const date = screen.getByTestId("datepicker");
      const vat = screen.getByTestId("vat");
      const pct = screen.getByTestId("pct");
      const commentary = screen.getByTestId("commentary");
      userEvent.selectOptions(type, "Restaurants et bars");
      userEvent.type(name, "Restaurant");
      userEvent.type(amount, "100");
      userEvent.type(date, "2021-10-10");
      userEvent.type(vat, "20");
      userEvent.type(pct, "20");
      userEvent.type(commentary, "Restaurant");
      /* === End of completion of the form === */

      /* === Upload of a file === */
      const fileInput = screen.getByTestId('file');
      fileInput.addEventListener('change', handleChangeFile);
      const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
      await userEvent.upload(fileInput, file, { applyAccept: false });
      /* === End of upload of a file === */

      /* === Check if the success message is displayed === */
      expect(fileInput.files.item(0)).toBe(file);
      expect(screen.queryByTestId('validation-message')).toBeVisible();
      expect(screen.queryByText("Parfait, le fichier est au bon format !"))
      /* === End of check if the success message is displayed === */
    });
    /* ========== End of test handleChangeFile success message ========== */

    /* ========== Test form if no file ========== */
    test('Should display an error if no file is sent', async () => {
      /* === Definition of functions === */
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };


      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const handleChangeFile = jest.spyOn(newBill, 'handleChangeFile');
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      /* === End of definition of functions === */

      /* === Completion of the form === */
      const type = screen.getByTestId("expense-type");
      const name = screen.getByTestId("expense-name");
      const amount = screen.getByTestId("amount");
      const date = screen.getByTestId("datepicker");
      const vat = screen.getByTestId("vat");
      const pct = screen.getByTestId("pct");
      const commentary = screen.getByTestId("commentary");
      userEvent.selectOptions(type, "Restaurants et bars");
      userEvent.type(name, "Restaurant");
      userEvent.type(amount, "100");
      userEvent.type(date, "2021-10-10");
      userEvent.type(vat, "20");
      userEvent.type(pct, "20");
      userEvent.type(commentary, "Restaurant");
      /* === End of completion of the form === */

      /* === Submission of the form */
      userEvent.click(screen.getByTestId('btn-send-bill'));
      /* === End of submission of the form */

      /* === Check if the error message is displayed === */
      const fileInput = screen.getByTestId('file');
      expect(fileInput.files.length).toBe(0);
      expect(fileInput.checkValidity()).toBe(false);
      /* === End of check if the error message is displayed === */
    });
    /* ========== End of form test if no file ========== */
  });
});


/* ========== Test for addStatus function ========== */
describe('Test for addStatus function', () => {
  describe('If I send a type of status, I should get the corresponding DOM element', () => {
    /* ========== Test for error case ========== */
    test(" Should return a div with the ID 'error-message'", () => {
      const status = 'error';
      const DOM = addStatus(status, 'test');
      expect(DOM).toBeTruthy();
      expect(DOM.id).toBe('error-message');
    });
    /* ========== End of test for error-message case ========== */

    /* ========== Test for success case ========== */
        test(" Should return a div with the ID 'validation-message'", () => {
      const status = 'success';
      const DOM = addStatus(status, 'test');
      expect(DOM).toBeTruthy();
      expect(DOM.id).toBe('validation-message');
    });
    /* ========== End of test for success case ========== */

    /* ========== Test for other case ========== */
    test('Should return a null element', () => {
      const status = 'other';
      const DOM = addStatus(status, 'test');
      expect(DOM).toBeNull();
    });
    /* ========== End of test for other case ========== */
  });
});
/* ========== End of test for addStatus function ========== */

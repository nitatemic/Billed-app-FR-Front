import VerticalLayout from './VerticalLayout.js'

export default (error) => {
  return (`
    <div class='layout'>
      ${VerticalLayout()}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Erreur</div>
        </div>
        <div data-testid="error-message">
          ${error ? error : ""}
        </div>
        <div class="404-error-message" data-testid="404-error-message">
        ${(error === 404) ? `On dirait que vous êtes perdu. Voici un bouton pour retrouver votre chemin.` : ""}
        </div>
        <!-- Button to go to login page -->
        <div class="button-container">
          <button class="btn btn-primary" data-testid="go-to-login" onclick="window.location.href='/'">Retour à la page de connexion</button>
        </div>
    </div>`
  )
}

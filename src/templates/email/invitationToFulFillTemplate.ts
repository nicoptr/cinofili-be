import process from "process";

export const INVITATION_TO_FULFILL_TEMPLATE = ( dto :{ movieName: string, eventName: string } ): string => {
    return `<!DOCTYPE html>
<html lang="it">
  <head>
    <meta charset="UTF-8" />
    <title>È tempo di votare!</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px; color: #333;">
    <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
      <tr>
        <td style="background-color: #4f46e5; color: #fff; padding: 16px 24px; text-align: center; font-size: 20px; font-weight: bold;">
          📽️ È il momento di votare!
        </td>
      </tr>
      <tr>
        <td style="padding: 24px;">
          <p style="margin: 0 0 16px 0;">Ciao <strong>Cinofilo!</strong> 🐶🎬</p>

          <p style="margin: 0 0 16px 0;">
            È arrivato il momento di lasciare la tua recensione per il film <strong>"${dto.movieName}"</strong>, appartenente all’evento <strong>"${dto.eventName}"</strong>.
          </p>

          <p style="margin: 0 0 16px 0;">
            Speriamo che la visione ti sia piaciuta e che tu abbia passato una splendida serata in compagnia!
          </p>

          <p style="margin: 0 0 16px 0;">
            Per votare ti basterà accedere alla piattaforma, aprire i dettagli dell’evento indicato in questa mail e premere il tasto <strong>"Vota"</strong>.
          </p>

          <p style="margin: 0 0 16px 0;">
            👉 <strong>Attenzione:</strong> potrai votare una sola volta e il giudizio non sarà modificabile. Ogni voto che esprimerai su ciascun parametro permetterà al film di concorrere per il premio dedicato, quindi… vota con criterio! 🎖️
          </p>

          <p style="margin: 0 0 24px 0;">
            E soprattutto ricordati che, nello spirito del gioco, i voti devono rimanere <strong>segreti</strong>. Verranno svelati solo durante la premiazione! 🤫✨
          </p>

          <p style="margin: 0 0 24px 0;">
            Se sei arrivato fin qui leggendo (e capendo) tutto, complimenti: fai parte dello <strong>0,0001%</strong> della popolazione 🧠💎  
            Ti meriti un premio! <a href="https://youtu.be/XSHcZ4rcBDk?list=RDXSHcZ4rcBDk&t=49">Eccolo</a>
          </p>

          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL!}" 
              style="background-color: #4f46e5; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
              Accedi alla piattaforma
            </a>
          </p>

          <p style="margin-top: 32px; font-size: 14px; color: #777;">
            Buona votazione e che vinca il migliore! 🏆🐾<br />
            <strong>Il team organizzativo</strong>
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
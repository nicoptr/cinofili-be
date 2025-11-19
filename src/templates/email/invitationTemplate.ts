import process from "process";

export const INVITATION_TEMPLATE = ( dto :{ participantName: string, eventName: string, subscriptionExpiryDateString: string, expiryDateString: string, categoryName: string } ): string => {
    return `<!DOCTYPE html>
                      <html lang="it">
                        <head>
                          <meta charset="UTF-8" />
                          <title>Invito a partecipare</title>
                        </head>
                        <body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px; color: #333;">
                          <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
                            <tr>
                              <td style="background-color: #4f46e5; color: #fff; padding: 16px 24px; text-align: center; font-size: 20px; font-weight: bold;">
                                Invito a partecipare 🎉
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 24px;">
                                <p style="margin: 0 0 16px 0;">Ciao <strong>${dto.participantName}</strong>,</p>
                                <p style="margin: 0 0 16px 0;">
                                  La Presidentessa ti ha invitato a partecipare all'evento <strong>"${dto.eventName}"</strong> con la categoria <strong>"${dto.categoryName}"</strong>.
                                </p>
                                <p style="margin: 0 0 16px 0;">
                                  Le candidature terminano il <strong>${dto.subscriptionExpiryDateString}</strong> e la premiazione si terrà il  <strong>${dto.expiryDateString}</strong>.
                                </p>
                                <p style="margin: 0 0 16px 0;">
                                  Ricorda che la tua categoria e la tua candidatura devono rimanere <strong>segrete</strong>, neanche la Presidentessa deve essere informata.
                                </p>
                                <p style="margin: 0 0 24px 0;">
                                  Questa è un messaggio autogenerato e deve rimanere tra noi ;)
                                </p>
                                <p style="text-align: center;">
                                  <a href="${process.env.CLIENT_URL!}" 
                                     style="background-color: #4f46e5; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
                                    Accedi alla piattaforma
                                  </a>
                                </p>
                                <p style="margin-top: 32px; font-size: 14px; color: #777;">
                                  Un caro saluto,<br />
                                  <strong>Il team organizzativo</strong>
                                </p>
                              </td>
                            </tr>
                          </table>
                        </body>
                      </html>`;
}
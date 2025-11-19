import process from "process";

export const SUBSCRIPTION_TEMPLATE = ( dto :{ movieName: string, categoryName: string, eventName: string } ): string => {
    return `<!DOCTYPE html>
                          <html lang="it">
                            <head>
                              <meta charset="UTF-8" />
                              <title>Nuova candidatura</title>
                            </head>
                            <body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px; color: #333;">
                              <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
                                <tr>
                                  <td style="background-color: #4f46e5; color: #fff; padding: 16px 24px; text-align: center; font-size: 20px; font-weight: bold;">
                                    Nuova candidatura ricevuta 🎬
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 24px;">
                                    <p style="margin: 0 0 16px 0;">Ciao <strong>Presidentessa</strong>,</p>
                                    <p style="margin: 0 0 16px 0;">
                                      Ti informiamo che il film <strong>"${dto.movieName}"</strong> è stato candidato per la categoria 
                                      <strong>"${dto.categoryName}"</strong> dell'evento <strong>"${dto.eventName}"</strong>.
                                    </p>
                                    <p style="margin: 0 0 24px 0;">
                                      Accedi alla piattaforma per verificare tutte le candidature e gestirle.
                                    </p>
                                    <p style="text-align: center;">
                                      <a href="${process.env.CLIENT_URL!}" 
                                         style="background-color: #4f46e5; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
                                        Accedi ora
                                      </a>
                                    </p>
                                    <p style="margin-top: 32px; font-size: 14px; color: #777;">
                                      A presto,<br />
                                      <strong>Il team Cinofilo</strong>
                                    </p>
                                  </td>
                                </tr>
                              </table>
                            </body>
                          </html>`;
}

export const SUBSCRIPTION_TEMPLATE_TEXT = `Ciao Presidentessa,
                      ti informiamo che un film è stato candidato per una categoria di un evento.
                      Accedi alla piattaforma per verificare tutte le candidature.
                      A presto,
                      Il team cinofilo`;
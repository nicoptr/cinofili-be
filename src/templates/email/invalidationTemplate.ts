import process from "process";

export const INVALIDATION_TEMPLATE = ( dto :{ movieName: string, ownerName: string, eventName: string } ): string => {
    return `<!DOCTYPE html>
                          <html lang="it">
                            <head>
                              <meta charset="UTF-8" />
                              <title>Candidatura non valida</title>
                            </head>
                            <body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px; color: #333;">
                              <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
                                <tr>
                                  <td style="background-color: #dc2626; color: #fff; padding: 16px 24px; text-align: center; font-size: 20px; font-weight: bold;">
                                    Candidatura non valida ⚠️
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 24px;">
                                    <p style="margin: 0 0 16px 0;">Ciao <strong>${dto.ownerName}</strong>,</p>
                                    <p style="margin: 0 0 16px 0;">
                                      La tua candidatura del film <strong>"${dto.movieName}"</strong> per l'evento <strong>"${dto.eventName}"</strong> è stata resa non valida dalla Presidentessa.
                                    </p>
                                    <p style="margin: 0 0 16px 0;">
                                      Per poter partecipare, accedi alla piattaforma e <strong>modifica il film</strong> oppure <strong>elimina la candidatura</strong> e riprova con un film diverso.
                                    </p>
                                    <p style="margin: 0 0 24px 0;">
                                      Ti ringraziamo per la comprensione e per la tua partecipazione al nostro evento.
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
import process from "process";
import {SubscriptionPlanDTO} from "@models/Subscription";
import {formatItaliaDate, formatItaliaTime} from "@utils/date";

export const PROJECTION_PLANNED_TEMPLATE = ( dto :{ eventName: string, sub: SubscriptionPlanDTO, categoryName: string, } ): string => {
    return `<!DOCTYPE html>
                      <html lang="it">
                        <head>
                          <meta charset="UTF-8" />
                          <title>Invito alla proiezione</title>
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
                                <p style="margin: 0 0 16px 0;">Ciao,</p>
                                <p style="margin: 0 0 16px 0;">
                                  La Presidentessa ti ha invitato alla proiezione del prossimo film dell'evento <strong>"${dto.eventName}"</strong>. Non posso dirti molto altro, ma... che resti tra noi: la categoria è <strong>"${dto.categoryName}"</strong>.
                                </p>
                                <p style="margin: 0 0 16px 0;">
                                  Le proiezione è prevista il <strong>${formatItaliaDate(dto.sub.projectAt)}</strong> alle ore <strong>${formatItaliaTime(dto.sub.projectAt)}</strong>, dove? <strong>${dto.sub.location.toUpperCase()}</strong>. Tieniti libero, ma se proprio non dovessi farcela avvisa la Presidentessa entro un giorno dalla proiezione.
                                </p>
                                <p style="margin: 0 0 16px 0;">
                                   Se dovessi ricevere un'altra mail come questa, fai fede all'ultima che ricevi, sarà quella la data di proiezione.
                                </p>
                                <p style="margin: 0 0 24px 0;">
                                  Ricorda che nello spirito del gioco non dovresti provare ad indovinare chi dei tuoi amici ha candidato il film che guarderete, se invece si tratta del tuo film non battere ciglio!.
                                </p>
                                <p style="text-align: center;">
                                  <a href="${process.env.CLIENT_URL!}" 
                                     style="background-color: #4f46e5; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
                                    Accedi alla piattaforma
                                  </a>
                                </p>
                                <p style="margin-top: 32px; font-size: 14px; color: #777;">
                                  Buon film,<br />
                                  <strong>Il team organizzativo</strong>
                                </p>
                              </td>
                            </tr>
                          </table>
                        </body>
                      </html>`;
}
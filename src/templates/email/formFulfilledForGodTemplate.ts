import process from "process";
import {CompleteSubscription} from "../../../prisma/generated/zod";
import {User} from "@prisma/client";

export const FORM_FULFILLED_FOR_GOD_TEMPLATE = (subscription: CompleteSubscription ): string => {
    return `<!DOCTYPE html>
                        <html lang="it">
                          <head>
                            <meta charset="UTF-8" />
                            <title>Nuova compilazione ricevuta</title>
                          </head>
                          <body style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 30px; color: #333;">
                            <table align="center" cellpadding="0" cellspacing="0" width="100%" 
                              style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
                              
                              <tr>
                                <td style="background-color: #4f46e5; color: #fff; padding: 16px 24px; text-align: center; font-size: 20px; font-weight: bold;">
                                  Nuova compilazione ricevuta ✨
                                </td>
                              </tr>
                        
                              <tr>
                                <td style="padding: 24px;">
                                  <p style="margin: 0 0 16px 0;">
                                    Cara Presidentessa,
                                  </p>
                        
                                  <p style="margin: 0 0 16px 0;">
                                    Ti informiamo che è stata appena effettuata una nuova compilazione 
                                    per il film <strong>"${subscription.movieName}"</strong>.
                                  </p>
                                  
                                  <p style="text-align: center;">
                                    <a href="${process.env.CLIENT_URL!}" 
                                       style="background-color: #4f46e5; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
                                      Accedi alla piattaforma
                                    </a>
                                  </p>
                        
                                  <p style="margin-top: 32px; font-size: 14px; color: #777;">
                                    Cordialmente,<br />
                                    <strong>Il team organizzativo</strong>
                                  </p>
                                </td>
                              </tr>
                              
                            </table>
                          </body>
                        </html>`;
}
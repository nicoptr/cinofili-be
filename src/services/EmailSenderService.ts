import nodemailer, { Transporter } from "nodemailer";
import {Service} from "fastify-decorators";
import process from "process";

export interface EmailOptions {
    from?: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

@Service()
export class EmailSenderService {
    private transporter: Transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false, // true for 465
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    public async sendEmail(options: EmailOptions): Promise<void> {
        try {
            const mailOptions = {
                from: options.from || process.env.SMTP_FROM || process.env.SMTP_USER,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email inviata: ${info.messageId}`);
        } catch (error) {
            console.error("❌ Errore durante l'invio dell'email:", error);
            throw error;
        }
    }

    public async sendSubscriptionEmail(eventName: string, movieName: string, categoryName: string, recipient: string) {

        const text = `Ciao Presidentessa,
                      ti informiamo che il film "${movieName}" è stato candidato per la categoria "${categoryName}" dell'evento "${eventName}".
                      Accedi alla piattaforma per verificare tutte le candidature.
                      A presto,
                      Il team cinofilo`;

        const html = `<!DOCTYPE html>
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
                                      Ti informiamo che il film <strong>"${movieName}"</strong> è stato candidato per la categoria 
                                      <strong>"${categoryName}"</strong> dell'evento <strong>"${eventName}"</strong>.
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
        try {
            await this.sendEmail({
                to: recipient,
                subject: "Nuova candidatura ricevuta",
                text: text,
                html: html,
            })
        } catch (e) {
            console.error(e);
        }
    }


    public async sendInvalidationEmail(ownerName: string, eventName: string, movieName: string, recipient: string) {

        const text = `Ciao ${ownerName},
                        la tua candidatura del film "${movieName}" per l'evento "${eventName}" è stata resa non valida dalla Presidentessa.
                        Per poter partecipare, accedi alla piattaforma e modifica il film oppure elimina la candidatura e riprova con un film diverso.
                        Ti ringraziamo per la comprensione e per la tua partecipazione.
                        Accedi qui: ${process.env.CLIENT_URL!}
                        Un caro saluto,  
                        Il team organizzativo`;


        const html = `<!DOCTYPE html>
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
                                    <p style="margin: 0 0 16px 0;">Ciao <strong>${ownerName}</strong>,</p>
                                    <p style="margin: 0 0 16px 0;">
                                      La tua candidatura del film <strong>"${movieName}"</strong> per l'evento <strong>"${eventName}"</strong> è stata resa non valida dalla Presidentessa.
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
        try {
            await this.sendEmail({
                to: recipient,
                subject: "La tua candidatura non è valida!",
                text: text,
                html: html,
            })
        } catch (e) {
            console.error(e);
        }
    }

    public async sendInvitationEmail(participantName: string, eventName: string, categoryName: string, recipient: string) {

        const text = `Ciao ${participantName},
                    la Presidentessa ti ha invitato a partecipare all'evento "${eventName}" con la categoria "${categoryName}".
                    Ricorda che la tua categoria e la tua candidatura devono rimanere segrete, neanche la Presidentessa deve essere informata.
                    Questa è un messaggio autogenerato e deve rimanere tra noi ;)
                    Accedi alla piattaforma per candidare un film: ${process.env.CLIENT_URL!}
                    Un caro saluto,  
                    Il team organizzativo`;

        const html = `<!DOCTYPE html>
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
                                <p style="margin: 0 0 16px 0;">Ciao <strong>${participantName}</strong>,</p>
                                <p style="margin: 0 0 16px 0;">
                                  La Presidentessa ti ha invitato a partecipare all'evento <strong>"${eventName}"</strong> con la categoria <strong>"${categoryName}"</strong>.
                                </p>
                                <p style="margin: 0 0 16px 0;">
                                  Ricorda che la tua categoria e la tua candidatura devono rimanere segrete, neanche la Presidentessa deve essere informata.
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

        try {
            await this.sendEmail({
                to: recipient,
                subject: "Sei stato invitato a partecipare!",
                text: text,
                html: html,
            });
        } catch (e) {
            console.error(e);
        }
    }
}
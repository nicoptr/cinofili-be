import nodemailer, {Transporter} from "nodemailer";
import {Service} from "fastify-decorators";
import process from "process";
import {SubscriptionPlanDTO} from "@models/Subscription";
import {formatItaliaDate, formatItaliaTime} from "@utils/date";
import {CompleteSubscription} from "../../prisma/generated/zod";
import {User} from "@prisma/client";
import {
    SUBSCRIPTION_UPDATE_TEMPLATE
} from "../templates/email/subscriptionTemplate";
import {INVALIDATION_TEMPLATE} from "../templates/email/invalidationTemplate";
import {INVITATION_TEMPLATE} from "../templates/email/invitationTemplate";
import {SUBSCRIPTION_TEMPLATE, SUBSCRIPTION_TEMPLATE_TEXT} from "../templates/email/subscriptionUpdateTemplate";
import {PROJECTION_PLANNED_TEMPLATE} from "../templates/email/projectionPlannedTemplate";
import {FORM_FULFILLED_FOR_GOD_TEMPLATE} from "../templates/email/formFulfilledForGodTemplate";
import {FORM_FULFILLED_FOR_OWNER_TEMPLATE} from "../templates/email/formFulfilledForOwnerTemplate";
import {INVITATION_TO_FULFILL_TEMPLATE} from "../templates/email/invitationToFulFillTemplate";

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
            console.log(`✅ Email inviata. Destinatario <${options.to}> ${info.messageId}`);
        } catch (error) {
            console.error("❌ Errore durante l'invio dell'email:", error);
            throw error;
        }
    }

    public async sendSubscriptionEmail(eventName: string, movieName: string, categoryName: string, recipient: string) {
        try {
            await this.sendEmail({
                to: recipient,
                subject: "Nuova candidatura ricevuta",
                text: SUBSCRIPTION_TEMPLATE_TEXT,
                html: SUBSCRIPTION_TEMPLATE({ movieName, eventName, categoryName}),
            })
        } catch (e) {
            console.error(e);
        }
    }

    public async sendSubscriptionUpdateEmail(eventName: string, movieName: string, categoryName: string, recipient: string) {
        try {
            await this.sendEmail({
                to: recipient,
                subject: "Candidatura aggiornata",
                html: SUBSCRIPTION_UPDATE_TEMPLATE( { eventName, movieName, categoryName } ),
            })
        } catch (e) {
            console.error(e);
        }
    }


    public async sendInvalidationEmail(ownerName: string, eventName: string, movieName: string, recipient: string) {
        try {
            await this.sendEmail({
                to: recipient,
                subject: "La tua candidatura non è valida!",
                html: INVALIDATION_TEMPLATE({ ownerName, eventName, movieName }),
            })
        } catch (e) {
            console.error(e);
        }
    }

    public async sendInvitationEmail(participantName: string, eventName: string, subscriptionExpiryDateString: string, expiryDateString: string, categoryName: string, recipient: string) {
        try {
            await this.sendEmail({
                to: recipient,
                subject: "Sei stato invitato a partecipare!",
                html: INVITATION_TEMPLATE({ participantName, eventName, subscriptionExpiryDateString, expiryDateString, categoryName }),
            });
        } catch (e) {
            console.error(e);
        }
    }

    public async sendPlannedProjectionEmail(eventName: string, dto: SubscriptionPlanDTO, categoryName: string, recipients: string[]) {

        for (const recipient of recipients) {
            try {
                await this.sendEmail({
                    to: recipient,
                    subject: "Nuova proiezione in programma!",
                    html: PROJECTION_PLANNED_TEMPLATE({ eventName, sub: dto, categoryName }),
                });
            } catch (e) {
                console.error(e);
            }
        }
    }

    public async sendFormFulfilledEmails(subscription: CompleteSubscription, user: User) {
        await this.sendFormFulfilledEmailForGod(subscription, user);
        await this.sendFormFulfilledEmailForOwner(subscription, user);
    }

    public async sendFormFulfilledEmailForGod(subscription: CompleteSubscription, user: User) {
        try {
            await this.sendEmail({
                to: process.env.GOD_EMAIL!,
                subject: "Nuova compilazione ricevuta",
                html: FORM_FULFILLED_FOR_GOD_TEMPLATE(subscription, user),
            });
        } catch (e) {
            console.error(e);
        }
    }

    public async sendFormFulfilledEmailForOwner(subscription: CompleteSubscription, user: User) {
        try {
            await this.sendEmail({
                to: subscription.owner.email,
                subject: "Nuova compilazione ricevuta",
                html: FORM_FULFILLED_FOR_OWNER_TEMPLATE(subscription, user),
            });
        } catch (e) {
            console.error(e);
        }
    }

    public async sendInvitationToFulfill(eventName: string, movieName: string, recipients: string[]) {
        try {
            for (const recipient of recipients) {
                try {
                    await this.sendEmail({
                        to: recipient,
                        subject: "È il momento di votare!",
                        html: INVITATION_TO_FULFILL_TEMPLATE({ eventName, movieName }),
                    });
                } catch (e) {
                    console.error(e);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }


}
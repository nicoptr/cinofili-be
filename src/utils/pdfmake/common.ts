import PdfPrinter from "pdfmake";
import { DateTime } from "luxon";

const PRIMARY = "#53abde";
const HEADER_TABLE = "#EEEEEE";
const FIRST_TABLE_ROW = "#FDFDFD";
const SECOND_TABLE_ROW = "#F6F6F6";

export const PDFPrinter = new PdfPrinter({
    Poppins: {
        normal: "public/assets/fonts/Poppins-Regular.ttf",
        bold: "public/assets/fonts/Poppins-Bold.ttf",
        italics: "public/assets/fonts/Poppins-Italic.ttf",
        bolditalics: "public/assets/fonts/Poppins-BoldItalic.ttf",
    }
});

export const PdfMakeUtils = {
    LOGO_BASE_64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjgAAAB7CAYAAAB5JvodAAAC70lEQVR4nO3dwW7iMBRA0XjE//+yu59FWwLUyfU5+whLfpirsPA4jmMe5M05xyvPjzGenpMVn8k9vTorx2FeduBM4Rn/Vi+A61txKDiI9vLqfpuXPdhnniFwAIAcgQMA5AgcACBH4AAAOQIHAMgROABAjsABAHIEDgCQI3AAgByBAwDkCBwAIEfgAHAL77iUlX08zj5o0Lgic7nenS5ENC/8hjlZ6+yZcuoNjs0GAK7MX1QAQI7AAQByBA4AkCNwAIAcgQMA5AgcACBH4AAAOQIHAMgROABAjsABAHIEDgCQI3AAgByBAwDkCBwAIEfgAAA5AgcAyBE4AECOwAEAcgQOAJAjcACAHIEDAOQIHAAgR+AAADmP1QsAWGWMMVevgd+bc47Va+A+vMEB4BYEKc8QOABAjsABAHIEDgCQI3AAgByBAwDkCBwAIEfgAAA5AgcAyBE4AECOwAEAcgQOAJAjcIDbcwkj8D+3iQMJIudeXJzJp3mDAwDkCBwAIEfgAAA5AgcAyBE4AECOwAEAcgQOAJAjcACAHIEDAOQIHAAgR+AAADkCBwDIETgAQI7AAQByBA4AkCNwAIAcgQMA5AgcACBH4AAAOQIHAMgROABAjsABAHIeqxfwaWOMuXoNVzDnHKvX8BfsNwDHEX+D48cOAPaUDhwAYE8CBwDIETgAQI7AAQByBA4AkCNwAIAcgQMA5AgcACBH4AAAOQIHAMgROABATjpwdrlgEu7OdxV4t/xt4rWD0wWi36vtNwDnpN/gAAB7EjgAQI7AAQByBA4AkCNwAIAcgQMA5AgcACBH4AAAOQIHAMgROABAjsABAHIEDgCQI3AAgByBAwDkCBwAIEfgAAA5AgcAyDkVOGOM+e6FALAHvyH8hcfZBw0ocBXOIz7JfN2Tv6gAgByBAwDkCBwAIEfgAAA5AgcAyBE4AECOwAEAcgQOAJAjcACAHIEDAOQIHAAgR+AAADkChx/NOccOn8l9mZc92Gee8QUlRFsDb/ICcAAAAABJRU5ErkJggg==',
    colors: {
        PRIMARY,
        HEADER_TABLE,
        FIRST_TABLE_ROW,
        SECOND_TABLE_ROW,
    },
    box: ({ w, h, r, color, margin, content }: { w: number, h: number, r: number, color: string, margin: number[], content: any }) => ({
        margin,
        stack: [
            {
                canvas: [
                    {
                        type: 'rect',
                        x: 0,
                        y: 0,
                        w, h, r, color
                    },
                ],
            },
            {
                relativePosition: {
                    x: 5,
                    y: -h,
                },
                stack: [content]
            }
        ]
    }),
    headerBox: ({ label, value, margin, pillWidth, fontSize, titleMargin }: { label: string, value: string, margin: number[], pillWidth?: number, fontSize?: number, titleMargin?: number[] }) => {
        return PdfMakeUtils.box({
            w: 273,
            h: 25,
            r: 5,
            color: PRIMARY,
            margin,
            content: {
                columns: [
                    {
                        width: 273 - (pillWidth || 72) - 17,
                        text: label,
                        fontSize: fontSize,
                        color: "white",
                        bold: true,
                        margin: titleMargin || [0, 5, 0, 0],
                    },
                    {
                        width: "*",
                        ...PdfMakeUtils.box({
                            w: pillWidth || 72,
                            h: 20,
                            r: 5,
                            color: "white",
                            margin: [0, 2.5, 0, 0],
                            content: {
                                margin: [0, 3, 0, 0],
                                text: value,
                                bold: false,
                            }
                        }),
                    }
                ]
            }
        });
    },
    line: ({ margin, color, thickness, width }: { margin: number[], color?: string, thickness?: boolean, width?: number }) => ({
        margin: margin,
        canvas: [
            {
                type: 'rect',
                x: 0,
                y: 0,
                w: width || 273,
                h: thickness || 1,
                color: color || PRIMARY,
            },
        ],
    }),
    headerTitle: (title: string, margin?: number[]) => ({
        text: title,
        alignment: "right",
        bold: true,
        color: PRIMARY,
        margin: margin || [0,0,0,5],
    }),
    headerValue: (label: string, value: string, margin?: number[], showLabel = true, fontSize?: number, showPoints = true) => ({
        text: [showLabel ? {
            text: label + (showPoints ? ": " : " "),
            bold: true,
            fontSize: fontSize,
        } : undefined, { text: value, fontSize: fontSize }],
        margin: margin || [0,0,0,5],
    }),
    headerBoxNoPill: ({ label, margin, pillWidth, invoice = false, order = false }: { label: string, margin: number[], pillWidth: number, invoice: boolean, order: boolean }) => {
        return PdfMakeUtils.box({
            w: 273,
            h: 25,
            r: 5,
            color: PRIMARY,
            margin,
            content: {
                columns: [
                    {
                        width: 350 - (pillWidth || 72) - 17,
                        text: label,
                        fontSize: 17,
                        color: "white",
                        bold: true,
                        margin: [order ? 54 : invoice ? 50 : 0, 2.5, 0, 0],
                    },
                ]
            }
        });
    },
    formatCurrency: (price: number) => {
        const [ int, decimal ] = price.toFixed(2).split(".");
        return `€ ${int},${decimal ? decimal.padEnd(2, "0") : "00"}`;
    },
    formatFraction: (left: number, right: number) => {
        const [ leftInt, leftDecimal ] = left.toFixed(2).split(".");
        const [ rightInt, rightDecimal ] = right.toFixed(2).split(".");

        const leftValue = `${leftInt},${leftDecimal ? leftDecimal.padEnd(2, "0") : "00"}`;
        const rightValue = `${rightInt},${rightDecimal ? rightDecimal.padEnd(2, "0") : "00"}`;

        return `€ ${leftValue}/${rightValue}`;
    },
    formatDate: (date?: Date) => {
        return DateTime.fromJSDate(new Date(date || "")).setLocale("it").toLocaleString({ month: "numeric", day: "numeric", year: "numeric" });
    },
    formatDateWithHours: (date?: Date) => {
        return DateTime.fromJSDate(new Date(date || "")).setLocale("it").toLocaleString({ month: "numeric", day: "numeric", year: "numeric", hour:"numeric", minute:"numeric" });
    }
}
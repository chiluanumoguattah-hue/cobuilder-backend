const nodemailer = require("nodemailer")

const sendEmail = async ({to,subject,text,html}) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })
        const mailOption = {
            from: `"Reset Link" <${process.env.EMAIL_USER}/>`,
            to,
            subject,
            text,
            html,
        }
        const info = await transporter.sendMail(mailOption);
        console.log("Email sent successfully: ",info.messageId);
        return info
    } catch (error) {
        console.error("Error sending email: ", error);
        throw new Error("Email could not be sent")
        
    }
}

module.exports = sendEmail
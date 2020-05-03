const sgMail = require('@sendgrid/mail')


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Sneds the user who signs up a nice welcome email
const SendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'Gareth.Lambe@Plannet21.ie',
        subject: 'Thanks for joining in',
        text: `Thanks for signing up ${name} to the new app`
    })
}


// Sends the user who cancels their subscription an email asking why??
const sendCancelEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'Gareth.Lambe@Plannet21.ie',
        subject: 'Sorry to see you GO!!!',
        text: `Hi ${name} we are extremely sorry you have cancelled. Could you spare a second and please tell us why you hae cancelled`
    })
}

module.exports = {
    SendWelcomeEmail,
    sendCancelEmail
}


















// //sgMail.send
// const msg = ({
//     to: 'Gareth.Lambe@Plannet21.ie',
//     from: 'Gareth.Lambe@Plannet21.ie',
//     subject: 'This is a test email',
//     text: 'This email was sent successfully'
// })


// sgMail.send(msg)
//     .then(() => {}, error => {
//         console.error(error);

//         if (error.response) {
//             console.error(error.response.body)
//         }
//     });
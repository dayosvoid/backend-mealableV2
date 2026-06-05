const resend = require("../config/resend.config");
const { welcomeEmail } = require("../templates/welcome");

const sendEmail = async (username, email) => {
  await resend.emails.send({
    from: "onboarding@mealable.eat",
    to: email,
    subject: `Welcome to Mealable, ${username}!`,
    html: welcomeEmail(username),
  });
};

module.exports = { sendEmail };

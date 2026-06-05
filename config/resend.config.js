const { Resend } = require("resend");
const { RESEND_KEY } = require("./config");

const resend = new Resend(RESEND_KEY);

module.exports = resend;

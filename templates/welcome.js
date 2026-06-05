const { BASE_URI } = require("../config/config");

const baseUrl = `https://${BASE_URI ? BASE_URI : "localhost:4000"}`;

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const welcomeEmail = (username = "John") => {
  const safeName = escapeHtml(username);

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Welcome to Mealable</title>
    <style>
      body {
        margin: 0;
        padding: 20px;
        background: #f5f7fb;
        font-family: Arial, Helvetica, sans-serif;
        color: #333333;
      }
      .container {
        max-width: 465px;
        margin: 40px auto;
        padding: 24px;
      }
      .card {
        background: #ffffff;
        border-radius: 8px;
        padding: 24px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
      }
      .logo {
        display: block;
        width: 80px;
        height: 80px;
        margin: 8px auto 0;
      }
      .heading {
        font-size: 22px;
        font-weight: 500;
        text-align: center;
        margin: 20px 0;
      }
      .text {
        font-size: 14px;
        line-height: 20px;
        margin: 0 0 12px;
      }
      .subtext {
        color: #555555;
        margin-bottom: 20px;
      }
      .cta-wrap {
        text-align: center;
        margin: 28px 0;
      }
      .button {
        background: #00a3ff;
        color: #ffffff;
        text-decoration: none;
        padding: 12px 20px;
        border-radius: 6px;
        display: inline-block;
        font-size: 14px;
        font-weight: 600;
      }
      @media only screen and (max-width: 480px) {
        body {
          padding: 12px;
        }
        .container {
          width: 100%;
          margin: 16px auto;
          padding: 8px;
        }
        .card {
          padding: 18px;
        }
        .heading {
          font-size: 18px;
        }
        .button {
          width: 100%;
          box-sizing: border-box;
          text-align: center;
        }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <img src="${baseUrl}/static/example-logo.png" alt="Logo Example" class="logo" />
        <h1 class="heading">Welcome to <strong>Mealable</strong>, ${safeName}</h1>
        <p class="text">Hello ${safeName},</p>
        <p class="text subtext">
          Welcome to <strong>Mealable</strong>, where you can plan your meals and enjoy eating with confidence.
          Your account is ready, and you can now proceed to log in to start organizing your meal journey.
        </p>
        <div class="cta-wrap">
          <a href="${baseUrl}/login" class="button">Log In to Mealable</a>
        </div>
        <p class="text" style="margin-bottom:0;">Cheers,<br />The Mealable Team</p>
      </div>
    </div>
  </body>
</html>`.trim();
};

module.exports = { welcomeEmail };

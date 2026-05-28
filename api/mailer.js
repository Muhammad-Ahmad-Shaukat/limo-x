const nodemailer = require("nodemailer");

function clean(value) {
  return String(value ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/<[^>]*>/g, "")
    .trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseBody(req) {
  if (!req.body) return {};

  if (typeof req.body === "string") {
    return Object.fromEntries(new URLSearchParams(req.body));
  }

  if (typeof req.body === "object") {
    return req.body;
  }

  return {};
}

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json; charset=utf-8");
  res.send(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 403, { success: false, message: "Method not allowed." });
  }

  const body = parseBody(req);
  const formType = clean(body.form_type || "contact");
  const name = clean(body.name);
  const email = clean(body.email).toLowerCase();
  const phone = clean(body.phone);

  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, {
      success: false,
      message: "Please provide a valid name and email.",
    });
  }

  let subject = "";
  let html = "";
  let text = "";
  let successMessage = "";

  if (formType === "booking") {
    const pickupDate = clean(body.pickup_date);
    const pickupTime = clean(body.pickup_time);
    const pax = clean(body.pax);
    const pickupLocation = clean(body.pickup_location);
    const dropoffLocation = clean(body.dropoff_location);
    const notes = clean(body.notes);

    if (!phone || !pickupDate || !pickupTime || !pickupLocation || !dropoffLocation) {
      return json(res, 400, {
        success: false,
        message: "Please fill in all required reservation fields.",
      });
    }

    subject = `New Reservation Request - ${name} - ${pickupDate} ${pickupTime}`;
    const rows = {
      Name: name,
      Email: email,
      Phone: phone,
      "Pickup Date": pickupDate,
      "Pickup Time": pickupTime,
      Passengers: pax || "-",
      "Pickup Location": pickupLocation,
      "Drop-off Location": dropoffLocation,
      Notes: notes || "-",
      Submitted: new Date().toISOString(),
      IP: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "-",
    };

    html = "<h2 style='color:#1a1a1a;font-family:Arial,sans-serif;'>New Reservation Request</h2>";
    html += "<table style='font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;width:100%;max-width:640px;'>";
    for (const [key, value] of Object.entries(rows)) {
      html +=
        `<tr><td style="padding:8px 12px;background:#f6f6f6;border:1px solid #e2e2e2;font-weight:600;width:200px;">${escapeHtml(key)}</td>` +
        `<td style="padding:8px 12px;border:1px solid #e2e2e2;">${escapeHtml(value)}</td></tr>`;
    }
    html += "</table>";
    html += "<p style='font-family:Arial,sans-serif;font-size:12px;color:#888;margin-top:18px;'>Sent automatically from longislandcarandlimo.com</p>";

    text = "New Reservation Request\n\n";
    for (const [key, value] of Object.entries(rows)) text += `${key}: ${value}\n`;
    successMessage =
      "Thank you! Your reservation request was sent. Our dispatch will contact you shortly to confirm.";
  } else {
    const message = clean(body.message);
    if (!message) {
      return json(res, 400, { success: false, message: "Please include a message." });
    }

    subject = `New Contact Message - ${name}`;
    const rows = {
      Name: name,
      Email: email,
      Phone: phone || "-",
      Message: message,
      Submitted: new Date().toISOString(),
      IP: req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "-",
    };

    html = "<h2 style='color:#1a1a1a;font-family:Arial,sans-serif;'>New Contact Message</h2>";
    html += "<table style='font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse;width:100%;max-width:640px;'>";
    for (const [key, value] of Object.entries(rows)) {
      html +=
        `<tr><td style="padding:8px 12px;background:#f6f6f6;border:1px solid #e2e2e2;font-weight:600;width:140px;">${escapeHtml(key)}</td>` +
        `<td style="padding:8px 12px;border:1px solid #e2e2e2;">${escapeHtml(value)}</td></tr>`;
    }
    html += "</table>";
    html += "<p style='font-family:Arial,sans-serif;font-size:12px;color:#888;margin-top:18px;'>Sent automatically from longislandcarandlimo.com</p>";

    text =
      `New Contact Message\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "-"}\n\nMessage:\n${message}\n`;
    successMessage = "Thank you! Your message has been sent. We will get back to you shortly.";
  }

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
    SMTP_FROM_NAME,
    SMTP_TO,
    SMTP_TO_NAME,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM || !SMTP_TO) {
    return json(res, 500, {
      success: false,
      message:
        "Server email is not configured yet. Please add SMTP environment variables in Vercel.",
    });
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE || "false").toLowerCase() === "true",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: SMTP_FROM_NAME ? `"${SMTP_FROM_NAME}" <${SMTP_FROM}>` : SMTP_FROM,
      to: SMTP_TO_NAME ? `"${SMTP_TO_NAME}" <${SMTP_TO}>` : SMTP_TO,
      replyTo: `${name} <${email}>`,
      subject,
      html,
      text,
    });

    return json(res, 200, { success: true, message: successMessage });
  } catch (error) {
    return json(res, 500, {
      success: false,
      message: "Sorry, we could not send your message right now. Please call us at +1 (718) 618-9155.",
    });
  }
};

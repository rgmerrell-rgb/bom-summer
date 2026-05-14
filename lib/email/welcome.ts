import { resend } from "@/lib/resend";

type WelcomeEmailOptions = {
  to:       string;
  fullName: string;
};

function buildHtml({ fullName }: Omit<WelcomeEmailOptions, "to">): string {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/dashboard`;
  const firstName    = fullName.split(" ")[0];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Book of Mormon Summer</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E2;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E2;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#1B3A5C;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:bold;letter-spacing:-0.5px;">
                Book of Mormon Summer
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 16px;font-size:18px;color:#2C2416;">
                Hi ${firstName},
              </p>
              <p style="margin:0 0 24px;font-size:16px;color:#6A6050;line-height:1.6;">
                Welcome to Book of Mormon Summer! You&rsquo;re all signed up.
                Each day you read, just open your dashboard and check in — that&rsquo;s it.
                Build your streak, earn milestones, and finish the summer strong.
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background:#1B3A5C;">
                    <a href="${dashboardUrl}"
                       style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:8px;">
                      Go to my dashboard &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #DDD5BB;text-align:center;">
              <p style="margin:0;font-size:12px;color:#6A6050;line-height:1.6;">
                You&rsquo;re receiving this because you signed up for Book of Mormon Summer.
                <br />If you didn&rsquo;t create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail(options: WelcomeEmailOptions): Promise<void> {
  const { to, fullName } = options;
  const firstName  = fullName.split(" ")[0];
  const fromAddress = process.env.RESEND_FROM_EMAIL ?? "Book of Mormon Summer <onboarding@resend.dev>";

  await resend.emails.send({
    from:    fromAddress,
    to,
    subject: `Welcome to Book of Mormon Summer, ${firstName}!`,
    html:    buildHtml({ fullName }),
  });
}

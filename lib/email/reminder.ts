import { resend } from "@/lib/resend";

type ReminderEmailOptions = {
  to:           string;
  firstName:    string;
  totalDaysRead: number;
  streak:       number;
  encouragement: string;
};

function buildHtml({
  firstName,
  totalDaysRead,
  streak,
  encouragement,
}: Omit<ReminderEmailOptions, "to">): string {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/dashboard`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your daily reading reminder</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E2;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E2;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#1B3A5C;padding:28px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:-0.5px;">
                Book of Mormon Summer
              </h1>
              <p style="margin:6px 0 0;color:#EDD98A;font-size:13px;">
                ${totalDaysRead} day${totalDaysRead === 1 ? "" : "s"} read this summer${streak > 1 ? ` &bull; ${streak}-day streak 🔥` : ""}
              </p>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:36px 40px 0;">
              <p style="margin:0;font-size:17px;color:#2C2416;">
                Good morning, ${firstName}.
              </p>
            </td>
          </tr>

          <!-- Encouragement -->
          <tr>
            <td style="padding:16px 40px 0;">
              <p style="margin:0;font-size:15px;color:#6A6050;line-height:1.7;">
                ${encouragement}
              </p>
            </td>
          </tr>

          <!-- CTA button -->
          <tr>
            <td style="padding:32px 40px 40px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px;background:#1B3A5C;">
                    <a href="${dashboardUrl}"
                       style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;border-radius:8px;">
                      Yes, I read today! 📖
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #DDD5BB;text-align:center;">
              <p style="margin:0;font-size:12px;color:#6A6050;line-height:1.6;">
                You&rsquo;re receiving this because you set up a daily reminder in Book of Mormon Summer.
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

export async function sendReminderEmail(options: ReminderEmailOptions): Promise<void> {
  const { to, firstName, ...rest } = options;
  const from = process.env.RESEND_FROM_EMAIL ?? "Book of Mormon Summer <onboarding@resend.dev>";

  await resend.emails.send({
    from,
    to,
    subject: `${firstName}, time for your daily reading 📖`,
    html: buildHtml({ firstName, ...rest }),
  });
}

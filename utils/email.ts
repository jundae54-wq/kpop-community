import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendNewPostEmail(emails: string[], groupName: string, postTitle: string, postUrl: string) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Skipping email notification.');
        return;
    }

    if (!emails || emails.length === 0) return;

    try {
        const data = await resend.emails.send({
            from: 'K-Pop Community <onboarding@resend.dev>', // For production, use your verified domain
            to: emails,
            subject: `[${groupName}] Novo Post: ${postTitle}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Novidades de <strong>${groupName}</strong>! 🎉</h2>
                    <p>Um novo post foi publicado no grupo que você segue:</p>
                    <div style="padding: 15px; border-left: 4px solid #f43f5e; background-color: #f9f9f9; margin-bottom: 20px;">
                        <h3 style="margin-top: 0; margin-bottom: 10px;">${postTitle}</h3>
                    </div>
                    <a href="${postUrl}" style="background-color: #f43f5e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Ler Post Completo
                    </a>
                    <p style="margin-top: 30px; font-size: 12px; color: #999;">
                        Você recebeu este email porque ativou as notificações para ${groupName} no K-Pop Community.
                    </p>
                </div>
            `,
        });

        console.log(`Email sent to ${emails.length} followers of ${groupName}`, data);
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

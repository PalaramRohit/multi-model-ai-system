import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

def send_email_notification(to_email, subject, body):
    """
    Sends an email notification via Gmail SMTP.
    Fails gracefully if credentials are not configured or if transmission fails.
    """
    smtp_user = os.getenv('SMTP_USER')
    smtp_password = os.getenv('SMTP_PASSWORD')

    # If SMTP is not configured, log warning and exit silently
    if not smtp_user or not smtp_password:
        print(f"[Warning] SMTP not configured. Skipped sending email: '{subject}' to {to_email}")
        return False

    try:
        # Create message container
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = to_email
        msg['Subject'] = subject

        # Attach text body
        msg.attach(MIMEText(body, 'html'))

        # Connect to Gmail SMTP server
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(smtp_user, smtp_password)
        
        # Send email
        server.sendmail(smtp_user, to_email, msg.as_string())
        server.quit()
        print(f"[Email Service] Email sent successfully to {to_email}: {subject}")
        return True
    except Exception as e:
        print(f"[Email Service Error] Failed to send email to {to_email}: {e}")
        return False

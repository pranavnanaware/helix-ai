import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from app.config.supabase import supabase

class EmailService:
    def __init__(self):
        self._settings = {
            'smtp_host': os.getenv('SMTP_HOST'),
            'smtp_port': int(os.getenv('SMTP_PORT')),
            'smtp_username': os.getenv('SMTP_USERNAME'),
            'smtp_password': os.getenv('SMTP_PASSWORD'),
            'from_name': os.getenv('SMTP_FROM_NAME'),
        }

    def test_connection(self) -> bool:
        """Test the SMTP connection."""
        try:
            
            required_fields = ['smtp_host', 'smtp_username', 'smtp_password']
            if not all(self._settings.get(field) for field in required_fields):
                print("SMTP settings not configured in environment variables, TestConnection")
                return False
            
            server = smtplib.SMTP(self._settings['smtp_host'], self._settings['smtp_port'])
            server.starttls()
            server.login(self._settings['smtp_username'], self._settings['smtp_password'])
            server.quit()
            return True
        except Exception as e:
            print(f"Error testing SMTP connection: {str(e)}")
            return False

    def send_email(self, to_email: str, subject: str, content: str, template_vars: Dict[str, str] = None) -> bool:
        """Send an email using SMTP."""
        try:
            required_fields = ['smtp_host', 'smtp_username', 'smtp_password']
            if not all(self._settings.get(field) for field in required_fields):
                print("SMTP settings not configured in environment variables, SendEmail")
                return False

            # Replace template variables if provided
            if template_vars:
                for key, value in template_vars.items():
                    content = content.replace(f"{{{key}}}", value)

            msg = MIMEMultipart()
            msg['From'] = f"{self._settings['from_name']} <{self._settings['smtp_username']}>"
            msg['To'] = to_email
            msg['Subject'] = subject

            msg.attach(MIMEText(content, 'html'))

            server = smtplib.SMTP(self._settings['smtp_host'], self._settings['smtp_port'])
            server.starttls()
            server.login(self._settings['smtp_username'], self._settings['smtp_password'])
            server.send_message(msg)
            server.quit()
            return True
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False

    def queue_email(self, sequence_id: str, step_number: int, to_email: str, subject: str, content: str, delay_days: int, user_first_name: str, user_last_name: str, user_title: str, user_location: str) -> bool:
        """Queue an email to be sent after a delay."""
        try:
            if not self.test_connection():
                print("SMTP connection failed")
                return False
                
            scheduled_time = datetime.utcnow() + timedelta(days=delay_days)
            
            email_data = {
                'sequence_id': sequence_id,
                'step_number': step_number,
                'to_email': to_email,
                'subject': subject,
                'content': content,
                'scheduled_time': scheduled_time.isoformat(),
                'status': 'PENDING',
                'created_at': datetime.utcnow().isoformat(),
                'template_vars': {'first_name': user_first_name, 'last_name': user_last_name, 'title': user_title, 'location': user_location}
            }
            
            result = supabase.table('email_queue').insert(email_data).execute()
            return bool(result.data)
        except Exception as e:
            print(f"Error queueing email: {str(e)}")
            return False

    def process_email_queue(self) -> None:
        """Process pending emails in the queue."""
        try:
            current_time = datetime.utcnow()
            
            # Get pending emails that are due
            result = supabase.table('email_queue')\
                .select('*')\
                .eq('status', 'PENDING')\
                .lte('scheduled_time', current_time.isoformat())\
                .execute()
            
            for email in result.data:
                success = self.send_email(
                    email['to_email'],
                    email['subject'],
                    email['content'],
                    email.get('template_vars', {})
                )
                
                # Update email status
                status = 'SENT' if success else 'FAILED'
                supabase.table('email_queue')\
                    .update({'status': status})\
                    .eq('id', email['id'])\
                    .execute()
                
        except Exception as e:
            print(f"Error processing email queue: {str(e)}")

# Create a singleton instance
email_service = EmailService() 
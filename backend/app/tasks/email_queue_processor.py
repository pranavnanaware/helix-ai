import time
import threading
from app.services.email_service import email_service

class EmailQueueProcessor:
    def __init__(self, interval_minutes: int = 5):
        self.interval_minutes = interval_minutes
        self._stop_event = threading.Event()
        self._thread = None

    def start(self):
        """Start the email queue processor in a background thread."""
        if self._thread is None or not self._thread.is_alive():
            self._stop_event.clear()
            self._thread = threading.Thread(target=self._run)
            self._thread.daemon = True
            self._thread.start()

    def stop(self):
        """Stop the email queue processor."""
        self._stop_event.set()
        if self._thread:
            self._thread.join()
            self._thread = None

    def _run(self):
        """Main loop for processing the email queue."""
        while not self._stop_event.is_set():
            try:
                email_service.process_email_queue()
            except Exception as e:
                print(f"Error in email queue processor: {str(e)}")
            
            # Wait for the specified interval
            for _ in range(self.interval_minutes * 60):
                if self._stop_event.is_set():
                    break
                time.sleep(1)

# Create a singleton instance
email_queue_processor = EmailQueueProcessor() 
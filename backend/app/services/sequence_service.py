from datetime import datetime, timedelta
import uuid
import json
import os
from typing import Dict, List, Any, Optional
from app.config.supabase import supabase, SEQUENCES_TABLE
from app.services.email_service import email_service
from threading import Thread

class SequenceService:
    @staticmethod
    def create_sequence(
        title: str,
        description: str,
        steps: List[Dict[str, Any]],
        metadata: Optional[Dict[str, Any]] = None,
        status: str = 'DRAFT'
    ) -> Dict[str, Any]:
        """Create a new sequence."""
        try:
            sequence_id = str(uuid.uuid4())
            sequence = {
                'id': sequence_id,
                'title': title,
                'description': description,
                'steps': steps,
                'metadata': metadata or {},
                'is_active': False,
                'status': status,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            result = supabase.table(SEQUENCES_TABLE).insert(sequence).execute()
            if not result.data:
                raise Exception("Failed to create sequence")
            return result.data[0]
        except Exception as e:
            raise Exception(f"Error creating sequence: {str(e)}")

    @staticmethod
    def update_sequence(
        sequence_id: str,
        updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update an existing sequence."""
        try:
            # Ensure we don't update the ID
            if 'id' in updates:
                del updates['id']
            # Add updated_at timestamp
            updates['updated_at'] = datetime.utcnow().isoformat()
            
            # If sequence is being activated, queue the first email in background
            if updates.get('is_active') is True:
                def queue_emails_background():
                    try:
                        sequence = SequenceService.get_sequence(sequence_id)
                        if sequence and sequence.get('steps'):
                            for step in sequence['steps']:
                                users = get_all_users()
                                for user in users:
                                    print(f"Queueing email for user {user['email']}")
                                    email_service.queue_email(
                                        sequence_id=sequence_id,
                                        step_number=step.get('step_number', 1),
                                        to_email=user['email'],
                                        subject=step.get('step_title', ''),
                                        content=step.get('content', ''),
                                        delay_days=int(step.get('delay_days', 1)),
                                        user_first_name=user['first_name'],
                                        user_last_name=user['last_name'],
                                        user_title=user['title'],
                                        user_location=user['location']
                                    )
                    except Exception as e:
                        print(f"Error in background email queueing: {str(e)}")
                
                # Start the background thread
                thread = Thread(target=queue_emails_background)
                thread.daemon = True
                thread.start()
            
            result = supabase.table(SEQUENCES_TABLE)\
                .update(updates)\
                .eq('id', sequence_id)\
                .execute()
                
            if not result.data:
                raise Exception("Failed to update sequence")
            return result.data[0]
        except Exception as e:
            raise Exception(f"Error updating sequence: {str(e)}")

    @staticmethod
    def get_sequence(sequence_id: str) -> Optional[Dict[str, Any]]:
        """Get a sequence by ID."""
        try:
            result = supabase.table(SEQUENCES_TABLE)\
                .select('*')\
                .eq('id', sequence_id)\
                .single()\
                .execute()
                
            return result.data if result.data else None
        except Exception as e:
            raise Exception(f"Error getting sequence: {str(e)}")

    @staticmethod
    def list_sequences(
        limit: int = 10,
        offset: int = 0,
        active_only: bool = True,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """List sequences with optional filtering."""
        try:
            query = supabase.table(SEQUENCES_TABLE)\
                .select('*')\
                .order('created_at', desc=True)\
                .limit(limit)\
                .offset(offset)
                
            if active_only:
                query = query.eq('is_active', True)
            if status:
                query = query.eq('status', status)
                
            result = query.execute()
            return result.data
        except Exception as e:
            raise Exception(f"Error listing sequences: {str(e)}")
        
    @staticmethod
    def delete_sequence(sequence_id: str) -> None:
        """Delete a sequence and its associated email queue entries."""
        try:
            # Delete sequence
            result = supabase.table('sequences')\
                .delete()\
                .eq('id', sequence_id)\
                .execute()
                
            if not result.data:
                raise Exception("Failed to delete sequence")
                
            # Delete associated email queue entries
            supabase.table('email_queue')\
                .delete()\
                .eq('sequence_id', sequence_id)\
                .execute()
                
        except Exception as e:
            raise Exception(f"Error deleting sequence: {str(e)}")

def get_all_users() -> List[Dict[str, Any]]:
    """Get all users from the JSON file."""
    try:
        users_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'users.json')
        with open(users_file, 'r') as f:
            return json.load(f)
    except Exception as e:
        raise Exception(f"Error reading users: {str(e)}")

def get_sequence(sequence_id: str) -> Dict[str, Any]:
    """Get a sequence by ID."""
    try:
        result = supabase.table('sequences').select('*').eq('id', sequence_id).execute()
        if not result.data:
            raise Exception(f"Sequence with ID {sequence_id} not found")
        return result.data[0]
    except Exception as e:
        raise Exception(f"Error getting sequence: {str(e)}")

def update_sequence_status(sequence_id: str, status: str) -> Dict[str, Any]:
    """Update sequence status."""
    try:
        result = supabase.table('sequences')\
            .update({'status': status, 'updated_at': datetime.utcnow().isoformat()})\
            .eq('id', sequence_id)\
            .execute()
        if not result.data:
            raise Exception(f"Failed to update sequence status")
        return result.data[0]
    except Exception as e:
        raise Exception(f"Error updating sequence status: {str(e)}")

def queue_sequence_emails(sequence_id: str) -> None:
    """Queue emails for all users in the sequence."""
    try:
        print(f"Starting to queue emails for sequence {sequence_id}")
        sequence = get_sequence(sequence_id)
        print(f"Found sequence: {sequence}")
        
        if not sequence.get('steps'):
            raise Exception("Sequence has no steps")
            
        # Validate steps structure
        for step in sequence['steps']:
            if not isinstance(step, dict):
                raise Exception("Each step must be a dictionary")
            if 'content' not in step:
                raise Exception("Each step must have a 'content' field")
            if 'delay_days' not in step:
                raise Exception("Each step must have a 'delay_days' field")
            if 'subject' not in step:
                raise Exception("Each step must have a 'subject' field")
            
        users = get_all_users()
        print(f"Found {len(users)} users")
        
        current_time = datetime.utcnow()
        
        for user in users:
            if not user.get('email'):
                print(f"Skipping user {user.get('first_name')} {user.get('last_name')} - no email address")
                continue
                
            print(f"Processing user: {user['email']}")
            
            for step_number, step in enumerate(sequence['steps'], 1):
                scheduled_time = current_time + timedelta(days=step.get('delay_days', 0))
                
                # Replace placeholders in content
                content = step.get('content', '')
                content = content.replace('{first_name}', user['first_name'])
                content = content.replace('{last_name}', user['last_name'])
                content = content.replace('{title}', user.get('title', ''))
                content = content.replace('{location}', user.get('location', ''))
                
                email_data = {
                    'sequence_id': sequence_id,
                    'step_number': step_number,
                    'to_email': user['email'],
                    'subject': step.get('subject', ''),
                    'content': content,
                    'scheduled_time': scheduled_time.isoformat(),
                    'status': 'PENDING',
                    'created_at': current_time.isoformat(),
                    'updated_at': current_time.isoformat()
                }
                
                print(f"Queueing email for step {step_number}: {email_data}")
                
                result = supabase.table('email_queue').insert(email_data).execute()
                if not result.data:
                    raise Exception(f"Failed to queue email for user {user['email']}")
                print(f"Successfully queued email for {user['email']}")
                    
    except Exception as e:
        print(f"Error in queue_sequence_emails: {str(e)}")
        raise Exception(f"Error queueing sequence emails: {str(e)}")

def publish_sequence(sequence_id: str) -> Dict[str, Any]:
    """Publish a sequence and queue emails for all users."""
    try:
        print(f"Starting to publish sequence {sequence_id}")
        # Update sequence status to ACTIVE
        sequence = update_sequence_status(sequence_id, 'ACTIVE')
        print(f"Updated sequence status to ACTIVE: {sequence}")
        
        # Queue emails for all users
        queue_sequence_emails(sequence_id)
        print("Successfully queued all emails")
        
        return sequence
    except Exception as e:
        print(f"Error in publish_sequence: {str(e)}")
        # If anything fails, set status back to DRAFT
        update_sequence_status(sequence_id, 'DRAFT')
        raise Exception(f"Error publishing sequence: {str(e)}")

# Create a singleton instance
sequence_service = SequenceService()

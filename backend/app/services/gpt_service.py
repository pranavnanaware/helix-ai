import os
import json
from typing import List, Dict, Any, Optional
from openai import OpenAI
from dotenv import load_dotenv
from app.services.message_service import message_service
from app.services.sequence_service import sequence_service

load_dotenv()

class GPTService:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-4o-mini"
        self.default_system_prompt = self.default_system_prompt = """
        You are a helpful assistant who helps create and edit email sequences for recruitment outreach for a technical/non-technical recruiter.
        The company is a startup called "SellScale" and the product is a platform that helps companies with their sales and outreach. 
        The user is a recruiter who is responsible for finding/sourcing candidates for the company.
        
        Follow this user-story-driven workflow strictly:

        1. Request a User Story (if not provided)
           - As the users what they want to recruit for, the level of experience, and what are they outreaching for.
           Make sure you ask one question at a time and wait for the user to respond before asking the next one.
           - Example (You can ask these but not limited to these): 
             "What is the target role?"
             Answer: "I am looking to recruit for a mid-level Python engineer."
             "What level of experience are you looking for?"
             Answer: "I am looking for candidates with 3-5 years of experience."
             "What are you outreaching for?"
             Answer: "I am looking to outreach to candidates who are interested in a new opportunity."
            User might give you all the information in one go so make sure you remember the information and not ask the same question again.

        2. Automatic Sequence Generation
           - Once the user story is provided, never ask for titles, content, or delays again.
           - Only create a new sequence if you don't have a sequence_id.
           - Use `create_sequence` to generate:
             • Sequence title (deriving from the user story)
             • Sequence description
             • Steps array: for each step include step_number, step_title, content, and a default delay_days inferred from the user story.

        3. Editing Existing Sequences
            Only edit the sequence if the users asks you to and if you have the sequence_id. But never ask the user for the sequence_id.
            Don't ask the user if they want to edit the sequence. If they want to edit the sequence, you will automatically edit it.
           - If the user requests an edit, interpret their instructions as modifications to the user story or step structure.
           - Call `edit_sequence` with:
             • The existing `sequence_id` (never ask the user for it)
             • An `updates` object describing what to change (e.g., number of steps, delays, content tweaks).
           - Do not request content, titles, or sequence_id from the user during edits.

        4. Publishing Sequences
            If the user wants to publish the sequence, call `edit_sequence` 
            with the sequence_id and the `is_active` field set to `true` and status set to `PUBLISHED`.
            Don't ask the user for the sequence_id.
            Don't ask the user if they want to publish the sequence.
        
        Also make sure when you generate the emails. 
        The user variables are the following:
        {
            "first_name": "John",
            "last_name": "Smith",
            "email": "john.smith@yopmail.com",
            "title": "Senior Software Engineer",
            "location": "San Francisco, CA"
        }
        So your placeholders should be only one of the following: {first_name}, {last_name}, {email}, {title}, and {location} if required. 
        While generating the emails and signature, if you are using my name, remember it as "John Dawg". Company name is SellScale.
        Always keep your questions focused on eliciting or refining the user story only. Do not break this flow."""
        
        
        # Initialize services
        self.message_service = message_service
        self.sequence_service = sequence_service
        
        # Define available functions for GPT to call
        self.available_functions = {
            "create_sequence": {
                "name": "create_sequence",
                "description": "Create a new email sequence for recruitment",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string", "description": "The title of the sequence"},
                        "description": {"type": "string", "description": "A detailed description of the sequence's purpose"},
                        "steps": {
                            "type": "array",
                            "description": "The sequence of emails to send",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "step_number": {"type": "integer", "description": "The order of this step in the sequence"},
                                    "type": {"type": "string", "description": "The type of message"},
                                    "content": {"type": "string", "description": "The content of the message"},
                                    "delay_days": {"type": "integer", "description": "Number of days to wait after previous step"},
                                    "step_title": {"type": "string", "description": "The title of the step"}
                                },
                                "required": ["step_number", "type", "content", "delay_days", "step_title"]
                            }
                        },
                        "metadata": {
                            "type": "object",
                            "description": "Additional information about the sequence",
                            "properties": {
                                "target_role": {"type": "string", "description": "The role being recruited for"},
                                "experience_level": {"type": "string", "description": "The experience level of the target candidates"},
                            }
                        }
                    },
                    "required": ["title", "description", "steps"]
                }
            },
            "edit_sequence": {
                "name": "edit_sequence",
                "description": "Edit an existing sequence",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "sequence_id": {"type": "string", "description": "The ID of the sequence to edit"},
                        "updates": {
                            "type": "object",
                            "description": "The updates to make to the sequence",
                            "properties": {
                                "title": {"type": "string", "description": "The new title of the sequence"},
                                "description": {"type": "string", "description": "The new description of the sequence"},
                                "steps": {
                                    "type": "array",
                                    "description": "The updated sequence of emails",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "step_number": {"type": "integer", "description": "The order of this step in the sequence"},
                                            "type": {"type": "string", "description": "The type of message"},
                                            "content": {"type": "string", "description": "The content of the message"},
                                            "delay_days": {"type": "integer", "description": "Number of days to wait after previous step"},
                                            "step_title": {"type": "string", "description": "The title of the step"}
                                        },
                                        "required": ["step_number", "type", "content", "delay_days", "step_title"]
                                    }
                                }
                            }
                        }
                    },
                    "required": ["sequence_id", "updates"]
                }
            }
        }

        # Define response type
        self.Response = {
            "type": str,
            "message": str,
            "role": str,
            "sequence": object
        }

    def chat_completion(self, session_id: str, message: str, sequence_id: str = None) -> dict:
        """Process a chat message and return a response.
        This can either ask questions or generate/edit sequences based on the conversation.
        """
        try:
            # Get recent messages for context
            recent_messages = self.message_service.get_messages(session_id, limit=10)
            # Start with system prompt
            messages = [
                {"role": "system", "content": self.default_system_prompt}
            ]

            # If updating an existing sequence, let the model know the ID
            if sequence_id:
                messages.append({
                    "role": "system",
                    "content": (
                        f"Current sequence_id: {sequence_id}. "
                        "When updating, you must call edit_sequence with that ID; "
                        "do not ask the user for it."
                    )
                })

            # Append recent conversation history
            for msg in recent_messages:
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", ""),
                })

            # Add the new user message
            user_message = {"role": "user", "content": message}
            if sequence_id:
                user_message["sequence_id"] = sequence_id
            messages.append(user_message)

            # Call the OpenAI API with function definitions
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                temperature=0.1,
                functions=list(self.available_functions.values()),
                function_call="auto",
            )

            response_message = response.choices[0].message
            content = response_message.content or "No response content available"

            # Store the assistant's message
            self.message_service.create_message(
                session_id=session_id,
                role="assistant",
                content=content,
                metadata={"sequence_id": sequence_id} if sequence_id else None
            )

            # Handle function calls
            if hasattr(response_message, 'function_call') and response_message.function_call:
                fn_name = response_message.function_call.name
                fn_args = json.loads(response_message.function_call.arguments)

                if fn_name == "create_sequence":
                    seq = self.sequence_service.create_sequence(
                        title=fn_args["title"],
                        description=fn_args["description"],
                        steps=fn_args["steps"],
                        metadata=fn_args.get("metadata", {})
                    )
                    response_data = {"type": "sequence_created", "message": f"Created '{seq['title']}' with {len(seq['steps'])} steps.", "sequence": seq, "role": "assistant"}

                elif fn_name == "edit_sequence":
                    es_id = fn_args.get("sequence_id") or sequence_id
                    if not es_id:
                        raise ValueError("Sequence ID is required for editing")
                    seq = self.sequence_service.update_sequence(sequence_id=es_id, updates=fn_args["updates"])
                    response_data = {"type": "sequence_updated", "message": f"Updated '{seq['title']}' with {len(seq['steps'])} steps.", "sequence": seq, "role": "assistant"}
            else:
                response_data = {"type": "chat", "message": content, "sequence": None, "role": "assistant"}

            return response_data
        except Exception as e:
            print(f"Error in chat completion: {str(e)}")
            raise

# instantiate service
gpt_service = GPTService()

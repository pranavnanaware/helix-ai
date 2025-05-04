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
        self.model = "gpt-4-turbo-preview"
        self.default_system_prompt = """You are a helpful assistant that can answer questions and help with outreach tasks.
            You generate sequences of emails to send to a list of contacts.
            The sequences are about recruiting people for a job.
            Keep your responses concise and to the point.
            Ask the users as many questions as possible but ask them one question at a time.
            Eg - 'What is the role being recruited for?', 'What is the experience level of the target candidates?', 'How many steps are in the sequence?', 'What is the delay between the emails?','What is the target role?'
            If the user has not provided enough information, ask them for more information.
            If the user has provided enough information, generate a sequence of emails to send to the contacts.
           """
        
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
                messages.insert(1, {
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
            user_message = {
                "role": "user",
                "content": message
            }
            if sequence_id:
                user_message["sequence_id"] = sequence_id
            messages.append(user_message)

            # Call the OpenAI API with function definitions
            print(messages)

            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                temperature=0.7,
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
                function_name = response_message.function_call.name
                function_args = json.loads(response_message.function_call.arguments)

                if function_name == "create_sequence":
                    sequence = self.sequence_service.create_sequence(
                        title=function_args["title"],
                        description=function_args["description"],
                        steps=function_args["steps"],
                        metadata=function_args.get("metadata", {})
                    )
                    response_data = {
                        "type": "sequence_created",
                        "message": f"I've created a new sequence titled '{sequence['title']}' with {len(sequence['steps'])} steps.",
                        "sequence": sequence,
                        "role": "assistant"
                    }

                elif function_name == "edit_sequence":
                    # Merge in the provided sequence_id if the user didn't include it
                    edit_sequence_id = function_args.get("sequence_id") or sequence_id
                    if not edit_sequence_id:
                        raise ValueError("Sequence ID is required for editing")
                    
                    # Get the existing sequence to merge with updates
                    existing_sequence = self.sequence_service.get_sequence(edit_sequence_id)
                    if not existing_sequence:
                        raise ValueError("Sequence not found")
                    
                    print(existing_sequence)
                    print(function_args)
                    # Merge the updates with the existing sequence
                    updates = function_args.get("updates", {})
                    
                    
                    sequence = self.sequence_service.update_sequence(
                        sequence_id=edit_sequence_id,
                        updates=updates
                    )
                    response_data = {
                        "type": "sequence_updated",
                        "message": f"I've updated the sequence titled '{sequence['title']}' with {len(sequence['steps'])} steps.",
                        "sequence": sequence,
                        "role": "assistant"
                    }
            else:
                response_data = {
                    "type": "chat",
                    "message": content,
                    "sequence": None,
                    "role": "assistant"
                }

            return response_data

        except Exception as e:
            print(f"Error in chat completion: {str(e)}")
            raise

    def _prepare_messages(
        self,
        recent_messages: List[Dict[str, Any]],
        user_message: str
    ) -> List[Dict[str, str]]:
        # unchanged...
        messages = [{"role": "system", "content": self.default_system_prompt}]
        for msg in reversed(recent_messages):
            messages.append({"role": msg["role"], "content": msg["content"]})
        messages.append({"role": "user", "content": user_message})
        return messages

    def _format_context(self, context: Dict[str, Any]) -> str:
        formatted = []
        for key, value in context.items():
            formatted.append(f"{key}: {value}")
        return "\n".join(formatted)

    def format_messages(self, messages: List[Dict[str, str]]) -> List[Dict[str, str]]:
        formatted = []
        for msg in messages:
            formatted.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})
        return formatted

# instantiate service
gpt_service = GPTService()

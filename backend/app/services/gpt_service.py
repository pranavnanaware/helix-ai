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
                        "title": {
                            "type": "string",
                            "description": "The title of the sequence"
                        },
                        "description": {
                            "type": "string",
                            "description": "A detailed description of the sequence's purpose"
                        },
                        "steps": {
                            "type": "array",
                            "description": "The sequence of emails to send",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "step_number": {
                                        "type": "integer",
                                        "description": "The order of this step in the sequence"
                                    },
                                    "type": {
                                        "type": "string",
                                        "enum": ["email", "linkedin"],
                                        "description": "The type of message"
                                    },
                                    "content": {
                                        "type": "string",
                                        "description": "The content of the message"
                                    },
                                    "delay_days": {
                                        "type": "integer",
                                        "description": "Number of days to wait after previous step"
                                    },
                                    "step_title": {
                                        "type": "string",
                                        "description": "The title of the step"
                                    }
                                },
                                "required": ["step_number", "type", "content", "delay_days", "step_title"]
                            }
                        },
                        "metadata": {
                            "type": "object",
                            "description": "Additional information about the sequence",
                            "properties": {
                                "target_role": {
                                    "type": "string",
                                    "description": "The role being recruited for"
                                },
                                "experience_level": {
                                    "type": "string",
                                    "description": "The experience level of the target candidates"
                                },
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
                        "sequence_id": {
                            "type": "string",
                            "description": "The ID of the sequence to edit"
                        },
                        "updates": {
                            "type": "object",
                            "description": "The updates to make to the sequence",
                            "properties": {
                                "title": {
                                    "type": "string",
                                    "description": "The new title of the sequence"
                                },
                                "description": {
                                    "type": "string",
                                    "description": "The new description of the sequence"
                                },
                                "steps": {
                                    "type": "array",
                                    "description": "The updated sequence of emails",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "step_number": {
                                                "type": "integer",
                                                "description": "The order of this step in the sequence"
                                            },
                                            "type": {
                                                "type": "string",
                                                "enum": ["email", "linkedin"],
                                                "description": "The type of message"
                                            },
                                            "content": {
                                                "type": "string",
                                                "description": "The content of the message"
                                            },
                                            "delay_days": {
                                                "type": "integer",
                                                "description": "Number of days to wait after previous step"
                                            },
                                            "step_title": {
                                                "type": "string",
                                                "description": "The title of the step"
                                            }
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

    def chat_completion(self, session_id: str, message: str) -> dict:
        """Process a chat message and return a response.
        This can either ask questions or generate/edit sequences based on the conversation.
        """
        try:
            # Get recent messages for context
            recent_messages = self.message_service.get_messages(session_id, limit=10)
            messages = [
                {"role": "system", "content": "You are a helpful assistant that helps create and edit email sequences for recruitment. When the user provides enough information about a sequence they want to create, you should call the create_sequence function. If they want to edit an existing sequence, call the edit_sequence function. Otherwise, ask clarifying questions to gather the necessary information."}
            ]
            
            # Add recent messages to context
            for msg in recent_messages:
                messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", "")
                })
            
            # Add the new user message
            messages.append({"role": "user", "content": message})

            # Make the API call with function calling enabled
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=messages,
                temperature=0.7,
                functions=list(self.available_functions.values()),
                function_call="auto"
            )

            response_message = response.choices[0].message
            content = response_message.content or "No response content available"

            # Store the assistant's message
            self.message_service.create_message(
                session_id=session_id,
                role="assistant",
                content=content
            )

        
            # If GPT wants to call a function
            if hasattr(response_message, 'function_call') and response_message.function_call:
                function_name = response_message.function_call.name
                function_args = json.loads(response_message.function_call.arguments)

                if function_name == "create_sequence":
                    # Create the sequence
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
                    # Edit the sequence
                    sequence = self.sequence_service.update_sequence(
                        sequence_id=function_args["sequence_id"],
                        updates=function_args["updates"]
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
        """Prepare messages with context and history."""
        messages = [{"role": "system", "content": self.default_system_prompt}]
        
        # Add recent messages in chronological order
        for msg in reversed(recent_messages):
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        return messages

    def _format_context(self, context: Dict[str, Any]) -> str:
        """Format context dictionary into a readable string."""
        formatted = []
        for key, value in context.items():
            formatted.append(f"{key}: {value}")
        return "\n".join(formatted)

    def format_messages(self, messages: List[Dict[str, str]]) -> List[Dict[str, str]]:
        """Format messages for the OpenAI API."""
        formatted = []
        for msg in messages:
            formatted.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })
        return formatted

gpt_service = GPTService() 
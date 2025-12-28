from typing import Optional, List, TypeVar, Generic, Type
from uuid import UUID
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel
from app.db.client import supabase

ModelType = TypeVar("ModelType", bound=BaseModel)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class IBugSchoolRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType], table_name: str):
        self.model = model
        self.table_name = table_name

    def get(self, id: UUID) -> Optional[ModelType]:
        try:
            response = supabase.table(self.table_name).select("*").eq("id", str(id)).single().execute()
            if response.data:
                return self.model(**response.data)
            return None
        except Exception as e:
            # Logger should be here
            print(f"Error fetching {self.table_name}: {e}")
            return None

    def create(self, obj_in: CreateSchemaType) -> ModelType:
        obj_data = jsonable_encoder(obj_in)
        try:
            response = supabase.table(self.table_name).insert(obj_data).execute()
            if response.data:
                return self.model(**response.data[0])
            raise Exception("Creation failed")
        except Exception as e:
            raise e

    def update(self, id: UUID, obj_in: UpdateSchemaType) -> Optional[ModelType]:
        obj_data = jsonable_encoder(obj_in, exclude_unset=True)
        # Remove None values
        obj_data = {k: v for k, v in obj_data.items() if v is not None}
        try:
            response = supabase.table(self.table_name).update(obj_data).eq("id", str(id)).execute()
            if response.data:
                return self.model(**response.data[0])
            return None
        except Exception as e:
            print(f"Error updating {self.table_name}: {e}")
            raise e

class UserRepository(IBugSchoolRepository):
    def get_by_email(self, email: str) -> Optional[ModelType]:
        try:
            response = supabase.table(self.table_name).select("*").eq("email", email).single().execute()
            if response.data:
                return self.model(**response.data)
            return None
        except Exception:
            return None

    def get_all(self) -> List[ModelType]:
        try:
            response = supabase.table(self.table_name).select("*").execute()
            if response.data:
                return [self.model(**item) for item in response.data]
            return []
        except Exception:
            return []

# Instantiate
from app.schemas.user import User, UserCreate, UserUpdate

user_repository = UserRepository(User, "users")


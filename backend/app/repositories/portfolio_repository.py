from uuid import UUID
from typing import List
from app.db.client import supabase
from app.schemas.portfolio import PortfolioItemCreate

class PortfolioRepository:
    def __init__(self):
        self.supabase = supabase

    def create(self, item_in: PortfolioItemCreate, user_id: UUID):
        data = item_in.model_dump()
        data["user_id"] = str(user_id)
        
        response = self.supabase.table("portfolio_items").insert(data).execute()
        return response.data[0]

    def get_by_user(self, user_id: UUID):
        response = self.supabase.table("portfolio_items")\
            .select("*")\
            .eq("user_id", str(user_id))\
            .order("created_at", desc=True)\
            .execute()
        return response.data

    def delete(self, item_id: UUID, user_id: UUID):
        # The RLS policy handles the ownership check, but good to be explicit or handle errors
        response = self.supabase.table("portfolio_items")\
            .delete()\
            .eq("id", str(item_id))\
            .eq("user_id", str(user_id))\
            .execute()
        return response.data

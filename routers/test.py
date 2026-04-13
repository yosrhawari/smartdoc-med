from fastapi import APIRouter, Depends, HTTPException
from utils.dependencies import get_current_user

router = APIRouter(prefix="/test", tags=["test"])


@router.get("/me")
def get_me(user = Depends(get_current_user)):
    return {
        "id": user["user_id"],
        "role": user["role"]
    }
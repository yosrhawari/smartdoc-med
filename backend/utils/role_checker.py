from fastapi import HTTPException, Depends
from utils.dependencies import get_current_user

def require_role(required_role: str):
    def role_checker(user: dict = Depends(get_current_user)):
        # Utilisation de .get() pour éviter une erreur si la clé 'role' manque
        if user.get("role") != required_role:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )
        return user
    return role_checker
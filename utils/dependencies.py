from fastapi import Depends, HTTPException 
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials 
from jose import jwt 
SECRET_KEY = "mysecretkey" 
ALGORITHM = "HS256" 


oauth2_scheme = HTTPBearer() 



def get_current_user( credentials: HTTPAuthorizationCredentials = Depends(oauth2_scheme) ): 
    try: 
        token = credentials.credentials 
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]) 
        return payload 
    except: 
        raise HTTPException(status_code=401, detail="Invalid token")
    
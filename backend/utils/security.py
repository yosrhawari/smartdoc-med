import bcrypt

# On n'utilise plus du tout passlib ni CryptContext
# On utilise directement les fonctions de la bibliothèque bcrypt

def hash_password(password: str) -> str:
    """Transforme un mot de passe en texte clair en un hash sécurisé"""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Vérifie si le mot de passe saisi correspond au hash de la BDD"""
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)
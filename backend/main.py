from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from pymongo import MongoClient
from bson import ObjectId

import jwt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pwdlib import PasswordHash
from datetime import datetime, timedelta, timezone


# =========================================================
# APP
# =========================================================

app = FastAPI()


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# =========================================================
# MONGODB
# =========================================================

URL = "mongodb://127.0.0.1:27017"

client = MongoClient(URL)

db = client["hrPortal"]

ticket_collection = db["serviceRequests"]
user_collection = db["users"]


# =========================================================
# SECURITY
# =========================================================

password_hash = PasswordHash.recommended()

SECRET_KEY = "HRServicePortalSecurityKey-ChangeThis"

ALGORITHM = "HS256"

TOKEN_EXPIRE_MINS = 30

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/login"
)


# =========================================================
# ROLES
# =========================================================

EMPLOYEE = 1
HR = 2
TEAM_LEAD = 3
ADMIN = 4


# =========================================================
# PYDANTIC MODELS
# =========================================================

class TicketCreate(BaseModel):
    title: str
    description: str
    category: str
    status: str = "NEW"


class TicketResponse(TicketCreate):
    id: str


class UserCreate(BaseModel):
    username: str
    password: str
    role: int


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


# =========================================================
# HELPERS
# =========================================================

def ticket_helper(ticket):
    """
    Convert a MongoDB ticket document into the format
    expected by the frontend.

    .get() is used so old/incomplete MongoDB documents
    do not crash the entire /tickets endpoint.
    """

    return {
        "id": str(ticket.get("_id", "")),
        "title": ticket.get("title", ""),
        "description": ticket.get("description", ""),
        "category": ticket.get("category", ""),
        "status": ticket.get("status", "NEW")
    }


def user_helper(user):
    return {
        "id": str(user["_id"]),
        "username": user["username"],
        "role": user["role"]
    }


# =========================================================
# JWT TOKEN
# =========================================================

def create_token(username: str, role: int):

    expire = (
        datetime.now(timezone.utc)
        + timedelta(minutes=TOKEN_EXPIRE_MINS)
    )

    payload = {
        "sub": username,
        "role": role,
        "exp": expire
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


# =========================================================
# CURRENT USER
# =========================================================

def get_current_user(
    token: str = Depends(oauth2_scheme)
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        username = payload.get("sub")
        role = payload.get("role")

        if username is None or role is None:

            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

    except jwt.ExpiredSignatureError:

        raise HTTPException(
            status_code=401,
            detail="Token has expired"
        )

    except jwt.InvalidTokenError:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    user = user_collection.find_one(
        {"username": username}
    )

    if user is None:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


# =========================================================
# ROLE CHECK
# =========================================================

def require_roles(*allowed_roles):

    def check_role(
        current_user=Depends(get_current_user)
    ):

        if current_user["role"] not in allowed_roles:

            raise HTTPException(
                status_code=403,
                detail="Permission denied"
            )

        return current_user

    return check_role


# =========================================================
# CREATE USER / REGISTER
# =========================================================

@app.post("/users", status_code=201)
def create_user(user: UserCreate):

    # Check username

    queried_user = user_collection.find_one(
        {"username": user.username}
    )

    if queried_user:

        raise HTTPException(
            status_code=409,
            detail="Username already exists"
        )

    # Check valid role

    if user.role not in [
        EMPLOYEE,
        HR,
        TEAM_LEAD,
        ADMIN
    ]:

        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    # Hash password

    hashed_pwd = password_hash.hash(
        user.password
    )

    user_data = {
        "username": user.username,
        "password": hashed_pwd,
        "role": user.role
    }

    # Insert user

    result = user_collection.insert_one(
        user_data
    )

    # Get created user

    new_user = user_collection.find_one(
        {"_id": result.inserted_id}
    )

    return user_helper(new_user)


# =========================================================
# LOGIN
# =========================================================

@app.post(
    "/login",
    response_model=TokenResponse
)
def login(
    form_data: OAuth2PasswordRequestForm = Depends()
):

    user = user_collection.find_one(
        {"username": form_data.username}
    )

    if user is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if not password_hash.verify(
        form_data.password,
        user["password"]
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    token = create_token(
        user["username"],
        user["role"]
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


# =========================================================
# CREATE HR SERVICE REQUEST
# =========================================================

@app.post(
    "/tickets",
    status_code=201,
    response_model=TicketResponse
)
def tickets_create(
    payload: TicketCreate,

    current_user=Depends(
        require_roles(
            EMPLOYEE,
            HR,
            TEAM_LEAD,
            ADMIN
        )
    )
):

    ticket_dict = payload.model_dump()

    # Store who created the request

    ticket_dict["createdBy"] = (
        current_user["username"]
    )

    result = ticket_collection.insert_one(
        ticket_dict
    )

    new_ticket = ticket_collection.find_one(
        {"_id": result.inserted_id}
    )

    return ticket_helper(new_ticket)


# =========================================================
# GET ALL HR SERVICE REQUESTS
# =========================================================

@app.get(
    "/tickets",
    response_model=list[TicketResponse]
)
def tickets_read_all(
    current_user=Depends(
        require_roles(
            EMPLOYEE,
            HR,
            TEAM_LEAD,
            ADMIN
        )
    )
):

    tickets_result = ticket_collection.find()

    tickets = [
        ticket_helper(ticket)
        for ticket in tickets_result
    ]

    return tickets


# =========================================================
# GET ONE REQUEST
# =========================================================

@app.get(
    "/tickets/{id}",
    response_model=TicketResponse
)
def ticket_read_by_id(
    id: str,

    current_user=Depends(
        require_roles(
            EMPLOYEE,
            HR,
            TEAM_LEAD,
            ADMIN
        )
    )
):

    if not ObjectId.is_valid(id):

        raise HTTPException(
            status_code=400,
            detail="Invalid request ID format"
        )

    ticket_result = ticket_collection.find_one(
        {"_id": ObjectId(id)}
    )

    if not ticket_result:

        raise HTTPException(
            status_code=404,
            detail="Service request not found"
        )

    return ticket_helper(ticket_result)


# =========================================================
# UPDATE REQUEST
# =========================================================

@app.put(
    "/tickets/{id}",
    response_model=TicketResponse
)
def ticket_update(
    id: str,

    payload: TicketCreate,

    current_user=Depends(
        require_roles(
            HR,
            TEAM_LEAD,
            ADMIN
        )
    )
):

    if not ObjectId.is_valid(id):

        raise HTTPException(
            status_code=400,
            detail="Invalid request ID format"
        )

    result = ticket_collection.update_one(

        {"_id": ObjectId(id)},

        {
            "$set": payload.model_dump()
        }
    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Service request not found"
        )

    new_ticket = ticket_collection.find_one(
        {"_id": ObjectId(id)}
    )

    return ticket_helper(new_ticket)


# =========================================================
# DELETE REQUEST
# =========================================================

@app.delete("/tickets/{id}")
def ticket_delete(
    id: str,

    current_user=Depends(
        require_roles(ADMIN)
    )
):

    if not ObjectId.is_valid(id):

        raise HTTPException(
            status_code=400,
            detail="Invalid request ID format"
        )

    result = ticket_collection.delete_one(
        {"_id": ObjectId(id)}
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Service request not found"
        )

    return {
        "message":
        "Service request deleted successfully"
    }
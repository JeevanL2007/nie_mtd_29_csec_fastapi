from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId

app = FastAPI()

URL = "mongodb://127.0.0.1:27017/"

client = MongoClient(URL)

db = client["hrPortal"]

request_collection = db["serviceRequests"]


class ServiceRequestCreate(BaseModel):

    employee: str

    category: str

    description: str

    status: str

    assignedTo: str | None = None


class ServiceRequestResponse(ServiceRequestCreate):

    id: str


def request_helper(request_doc):

    return {
        "id": str(request_doc["_id"]),
        "employee": request_doc["employee"],
        "category": request_doc["category"],
        "description": request_doc["description"],
        "status": request_doc["status"],
        "assignedTo": request_doc["assignedTo"]
    }


@app.post(
    "/requests",
    status_code=201,
    response_model=ServiceRequestResponse
)
def request_create(payload: ServiceRequestCreate):

    request_dict = payload.model_dump()

    result = request_collection.insert_one(request_dict)

    new_request = request_collection.find_one(
        {"_id": result.inserted_id}
    )

    return request_helper(new_request)


@app.get(
    "/requests",
    response_model=list[ServiceRequestResponse]
)
def request_read_all():

    docs = request_collection.find()

    requests = [
        request_helper(doc)
        for doc in docs
    ]

    return requests


@app.get(
    "/requests/{id}",
    response_model=ServiceRequestResponse
)
def request_read_by_id(id: str):

    if not ObjectId.is_valid(id):

        raise HTTPException(
            detail="Invalid Request ID",
            status_code=403
        )

    doc = request_collection.find_one(
        {"_id": ObjectId(id)}
    )

    if not doc:

        raise HTTPException(
            detail="Request Not Found",
            status_code=404
        )

    return request_helper(doc)


@app.put(
    "/requests/{id}",
    response_model=ServiceRequestResponse
)
def request_update(
    id: str,
    payload: ServiceRequestCreate
):

    if not ObjectId.is_valid(id):

        raise HTTPException(
            detail="Invalid Request ID",
            status_code=403
        )

    request_dict = payload.model_dump()

    result = request_collection.update_one(
        {"_id": ObjectId(id)},
        {"$set": request_dict}
    )

    if result.matched_count == 0:

        raise HTTPException(
            detail="Request Not Found",
            status_code=404
        )

    new_request = request_collection.find_one(
        {"_id": ObjectId(id)}
    )

    return request_helper(new_request)


@app.delete("/requests/{id}")
def request_delete(id: str):

    if not ObjectId.is_valid(id):

        raise HTTPException(
            status_code=403,
            detail="Invalid Request ID"
        )

    result = request_collection.delete_one(
        {"_id": ObjectId(id)}
    )

    if result.deleted_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Request Not Found"
        )

    return {
        "message": "Request deleted successfully"
    }
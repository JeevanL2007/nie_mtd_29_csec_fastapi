 #need to enter whats to be read inside the ""..suppose if we want to read users enter users.
# 5 ops : read , patch , create , update , delete
#http methods are called verbs...url is called noun
#get keyword is used to fetch some data from the  api and the api becomes available.
#python -m uvicorn main:app --reload
from fastapi import FastAPI , HTTPException
from pydantic import BaseModel
app = FastAPI()


@app.get("/")
def home():
    return {"message" : "Hello World"}
db = {        #defining a array ...contains dictionaries of tickets
    1 : {"id" : 1 , "title" : "computer is not on",     #defining cred operations on tickets.
    "description" : "power button is not working"},
    2 : {"id" : 2 , "title" : "internet is not working",
        "description" : "wifi prob",
        "category" : "Hardware", "status" : "NEW"}
}


class TicketCreate(BaseModel):
    title : str
    description : str
    category : str
    status : str

class TicketResponse(TicketCreate):
    id :int


@app.get("/tickets")    #extract the url from the cmd then paste in the browser followed by /ticket and /docs(for docs).
def ticket_readall():
    return list(db.values())


@app.get("/tickets")    #extract the url from the cmd then paste in the browser followed by /ticket and /docs(for docs).
def ticket_readall():
    return list(db.values())


@app.get("/tickets/{id}")
def ticket_read_by_id(id : int):
    if id not in db:
        raise HTTPException(status_code=404 , detail = "Ticket not found")
    return db[id]

@app.post("/tickets", status_code=201 , response_model = TicketResponse)
def ticket_create(ticket_payload : TicketCreate):
    new_id = max(db.keys(), default=0) + 1
    db[new_id] = {"id" : new_id , **ticket_payload.model_dump()}
    return db[new_id]

@app.put("/tickets/{id}",response_model=TicketResponse)
def ticket_update(id : int , **ticket_payload: TicketCreate):
    if id not in db:
        raise HTTPException(status_code=404 , detail="Ticket not found")
    db[id] = {"id" : id, **ticket_payload.model_dump()}
    return db[id]

@app.delete("/tickets/{id}")
def tickets_delete(id : int):
    if id not in db:
        raise HTTPException(detail= "Ticket not found", status_code=404)
    del db[id]
    return {"message" : "Ticket deleted"}
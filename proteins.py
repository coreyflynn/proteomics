import re
import sys
import csv
import os
import json
from pymongo import MongoClient
from pymongo.collection import Collection
from bson.objectid import ObjectId

# Connects to the Mongo client
client = MongoClient('localhost', 27017)
evidence = client.proteomics.evidence
proteins = client.proteomics.proteins

# For each protein, use this process to see if it exists.
def process (protein, expid, modifiedSequence, intensity, mods):

    res = proteins.find({"protein":protein})

    # Does protein exist?

    if res.count() == 0:
    # No - create new document for protein
        print("New protein found: " + protein)

        obj = {"protein":protein, "modifiedSequences":{}}
        obj["modifiedSequences"][modifiedSequence] = {expid:{}}

        if intensity != "":
            obj["modifiedSequences"][modifiedSequence][expid]['intensity'] = [intensity]
        else:
            obj["modifiedSequences"][modifiedSequence][expid]['intensity'] = []

        obj["modifiedSequences"][modifiedSequence][expid]['modifications'] = [mods]

        proteins.insert(obj)

    else:
    # Yes - append to protein document
        obj = res[0]

        # Does the modification exist?
        if modifiedSequence in obj["modifiedSequences"]:
        # if hasattr(obj["modifications"], modifiedSequence):
        # Yes

            # Does the experiment exist?
            if expid in obj["modifiedSequences"][modifiedSequence]:

            # Yes
                key = "modifiedSequences." + modifiedSequence + "." + expid
                toPush = {key + '.intensity':intensity}
                if mods not in obj['modifiedSequences'][modifiedSequence][expid]['modifications']:
                    toPush[key + '.modifications'] = mods
                proteins.update({"protein":protein}, {'$push':toPush})

            else:

            # No
                key = "modifiedSequences." + modifiedSequence + "." + expid
                toPush = {key + '.intensity':[intensity]}
                toPush[key + '.modifications'] = [mods]
                proteins.update({"protein":protein}, {'$set':toPush})

        else:
        # No
            key = "modifiedSequences." + modifiedSequence
            toPush = {key:{expid:{'intensity':[intensity]}}}
            toPush[key][expid]['modifications'] = [mods]
            proteins.update({"protein":protein}, {'$set':toPush})


proteins.drop()

# Loop through all proteins in the experiment collection.

for document in evidence.find({},{"expID":1,"proteins":1,"modified sequence":1,"modifications":1,"intensity":1}).batch_size(30):
    try:
        if (isinstance(document["proteins"], list)):
            for protein in document["proteins"]:
                try:
                    process(protein.upper(),str(ObjectId(document["expID"])),document["modified sequence"],document["intensity"],document['modifications'])
                except:
                    print("Something happened...")
        else:
            process(document["proteins"].upper(),str(ObjectId(document["expID"])),document["modified sequence"],document["intensity"],document['modifications'])
    except:
        print ("Proteins attr doesn't exist...")

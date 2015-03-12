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
modSeqs = client.proteomics.modifiedSequences

# For each gene, use this process to see if it exists.
def process (expid, modifiedSequence, seq, intensity, mods):

    criteria = {"modifiedSequence":modifiedSequence}
    res = modSeqs.find(criteria)

    # Does gene exist?

    if res.count() == 0:
    # No - create new document for mod
        print("New mod found: " + modifiedSequence)

        obj = {"modifiedSequence":modifiedSequence, "sequence":seq, "experiments":{}}
        if intensity != "":
            obj["experiments"][expid] = {"intensity":[intensity], "modifications": [mods]}
        else:
            obj["experiments"][expid] = {"intensity":[], "modifications": [mods]}
        modSeqs.insert(obj)

    else:
    # Yes - append to mod document
        obj = res[0]
        key = "experiments." + str(expid)
        toPush = {}

        # Does the experiment exist?
        if expid in obj['experiments']:
        # Yes
            if mods not in obj['experiments'][expid]['modifications']:
                toPush[key + '.modifications'] = mods

            if intensity != "":
                toPush[key + ".intensity"] = intensity

            if toPush != {}:
                modSeqs.update(criteria, {'$push':toPush})

        else:
        # No
            if intensity != "":
                toPush[key + ".intensity"] = [intensity]
            else:
                toPush[key + ".intensity"] = []

            toPush[key + ".modifications"] = [mods]
            modSeqs.update(criteria, {'$set':toPush})

modSeqs.drop()

# Loop through all gene names in the experiment collection.

for document in evidence.find({},{"expID":1,"modified sequence":1,"sequence":1,"intensity":1,"modifications":1}).batch_size(30):
        process(str(ObjectId(document["expID"])),document["modified sequence"].upper(),document["sequence"].upper(),document["intensity"], document["modifications"])
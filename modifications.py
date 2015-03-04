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
def process (expid, modifiedSequence, intensity):

    res = geneNames.find({"gene":geneName})

    # Does gene exist?

    if res.count() == 0:
    # No - create new document for gene
        print("New gene found: " + geneName)

        obj = {"gene":geneName, "modifications":{}}
        if intensity != "":
            obj["modifications"][modifiedSequence] = {str(expid):[intensity]}
        else:
            obj["modifications"][modifiedSequence] = {str(expid):[]}
        geneNames.insert(obj)

    else:
    # Yes - append to gene document
        obj = res[0]

        # Does the modification exist?
        if modifiedSequence in obj["modifications"]:
        # if hasattr(obj["modifications"], modifiedSequence):
        # Yes

            # Does the experiment exist?
            if str(expid) in obj["modifications"][modifiedSequence]:
            # Yes
                key = "modifications." + modifiedSequence + "." + str(expid)
                toPush = {key:intensity}
                if intensity != "":
                    geneNames.update({"gene":geneName}, {'$push':toPush})

            else:
            # No
                key = "modifications." + modifiedSequence + "." + str(expid)
                if intensity != "":
                    toPush = {key:[intensity]}
                else:
                    toPush = {key:[]}
                geneNames.update({"gene":geneName}, {'$set':toPush})

        else:
        # No
            key = "modifications." + modifiedSequence
            if intensity != "":
                toPush = {key:{str(expid):[intensity]}}
            else:
                toPush = {key:{str(expid):[]}}
            geneNames.update({"gene":geneName}, {'$set':toPush})


geneNames.drop()

# Loop through all gene names in the experiment collection.

for document in evidence.find({},{"expID":1,"modified sequence":1,"intensity":1}).batch_size(30):
        process(document["expID"],document["modified sequence"].upper(),document["intensity"])